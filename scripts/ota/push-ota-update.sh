#!/bin/bash
# دفع تحديث هوائي (OTA) لتطبيق HDR — سوق الشرق
#
# الاستخدام:
#   ./scripts/ota/push-ota-update.sh 1.0.1 "وصف التحديث بالعربية"
#
# ما يفعله:
#   1. يبني حزمة JS (Hermes bytecode) من الكود الحالي
#   2. يحسب بصمة SHA256
#   3. يرفع الحزمة إلى Firebase Storage (admin/ota/hdr/)
#   4. يحدّث manifest.json — التطبيق يلتقطه عند الإقلاع القادم
#
# ملاحظة: التحديث الهوائي مخصص لتغييرات JS والتصميم والنصوص.
# لا يدعم: مكتبات native جديدة، صور محلية جديدة، تغيير AndroidManifest.

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "الاستخدام: $0 <النسخة> \"<ملاحظات الإصدار>\""
  echo "مثال: $0 1.0.1 \"إصلاح عرض الأسعار في البطاقات\""
  exit 1
fi

VERSION="$1"
NOTES="$2"
RUNTIME="1"  # يجب أن يطابق OTA_RUNTIME في src/ota/otaConfig.ts

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
WORK_DIR="/tmp/hdr-ota-$VERSION"
BUCKET="souq-alsharq-app.firebasestorage.app"
OTA_PATH="admin/ota/hdr"
GCLOUD="$HOME/workspace/tools/google-cloud-sdk/bin/gcloud"

echo "=== بناء حزمة JS للإصدار $VERSION ==="
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"
cd "$APP_DIR"

# 1) بناء حزمة JS عادية
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output "$WORK_DIR/bundle.js" \
  --assets-dest "$WORK_DIR/assets" \
  2>&1 | tail -3

# 2) ترجمة إلى Hermes bytecode (مطابق لما يبنيه الـAPK — بدونه ينهار التطبيق)
HERMESC="$APP_DIR/node_modules/hermes-compiler/hermesc/linux64-bin/hermesc"
if [ ! -f "$HERMESC" ]; then
  echo "خطأ: hermesc غير موجود في $HERMESC"
  exit 1
fi
"$HERMESC" -emit-binary -out "$WORK_DIR/bundle-$VERSION.android.bundle" "$WORK_DIR/bundle.js" \
  > /dev/null 2>&1

BUNDLE="$WORK_DIR/bundle-$VERSION.android.bundle"
if [ ! -f "$BUNDLE" ]; then
  echo "خطأ: فشل بناء الحزمة"
  exit 1
fi

SIZE=$(du -h "$BUNDLE" | cut -f1)
SHA=$(sha256sum "$BUNDLE" | cut -d' ' -f1)
echo "الحزمة: $SIZE — SHA256: ${SHA:0:16}..."

echo "=== الرفع إلى Firebase Storage ==="
$GCLOUD storage cp "$BUNDLE" "gs://$BUCKET/$OTA_PATH/bundle-$VERSION.android.bundle" \
  --project=souq-alsharq-app 2>&1 | tail -2

# جعل الملف قابلًا للقراءة العامة (القاعدة admin/** تسمح بالقراءة العامة أصلًا)
BUNDLE_URL="https://firebasestorage.googleapis.com/v0/b/$BUCKET/o/$(python3 -c "import urllib.parse; print(urllib.parse.quote('$OTA_PATH/bundle-$VERSION.android.bundle', safe=''))")?alt=media"

echo "=== تحديث manifest.json ==="
PUBLISHED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "$WORK_DIR/manifest.json" <<EOF
{
  "runtime": "$RUNTIME",
  "version": "$VERSION",
  "bundleUrl": "$BUNDLE_URL",
  "sha256": "$SHA",
  "minAppVersionCode": 1,
  "releaseNotes": "$NOTES",
  "publishedAt": "$PUBLISHED_AT"
}
EOF

$GCLOUD storage cp "$WORK_DIR/manifest.json" "gs://$BUCKET/$OTA_PATH/manifest.json" \
  --project=souq-alsharq-app 2>&1 | tail -2

# منع التخزين المؤقت للـmanifest — يجب أن يرى التطبيق أحدث نسخة دائمًا
$GCLOUD storage objects update "gs://$BUCKET/$OTA_PATH/manifest.json" \
  --project=souq-alsharq-app \
  --cache-control="no-cache, max-age=0" 2>&1 | tail -1 || true

echo ""
echo "✅ تم دفع التحديث $VERSION"
echo "   التطبيق سيلتقطه عند الإقلاع القادم (خلال دقائق من فتح التطبيق)"
echo "   للتراجع: أعد تشغيل السكربت بنسخة أقدم، أو احذف manifest.json"
