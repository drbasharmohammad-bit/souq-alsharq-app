// إعدادات التطبيق — تُضبط قبل الإطلاق
export const ADMIN_EMAIL = 'drbasharmohammad@gmail.com'; // إيميل المدير — الدخول بحساب جوجل

export const APP_NAME = 'HDR';

// Web OAuth Client ID من Firebase Console (Authentication ← Sign-in method ← Google)
// من النوع 3 (Web) في google-services.json — مطلوب لاستخراج idToken على الأندرويد
export const GOOGLE_WEB_CLIENT_ID =
  '885355670157-ro8ich2vjaq8rqh8e0d2fm7ddr5kva8s.apps.googleusercontent.com';

// Cloudinary — استضافة الصور (الخطة المجانية، بلا بطاقة)
// Firebase Storage يتطلب Blaze المدفوعة، فاعتُمد Cloudinary بديلًا (10 أكتوبر 2026)
export const CLOUDINARY_CLOUD_NAME = 'vruj3j0p';
export const CLOUDINARY_UPLOAD_PRESET = 'sharq_unsigned'; // Unsigned — مجلد sharq
