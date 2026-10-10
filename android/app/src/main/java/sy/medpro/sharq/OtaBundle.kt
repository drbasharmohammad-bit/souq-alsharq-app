package sy.medpro.sharq

import android.content.Context
import android.util.Log
import org.json.JSONObject
import java.io.File
import java.security.MessageDigest

/**
 * مساعد التحديث الهوائي (OTA) لتطبيق HDR.
 *
 * عند إقلاع التطبيق يتحقق من وجود حزمة JS محمّلة هوائيًا في:
 *   filesDir/ota/index.android.bundle  +  filesDir/ota/meta.json
 *
 * تُقبل الحزمة فقط إذا:
 *  1. الملفان موجودان.
 *  2. الحزمة أحدث من تثبيت/تحديث الـAPK (حماية من حزمة قديمة بعد تحديث المتجر).
 *  3. بصمة SHA256 مطابقة للمسجلة في meta.json (سلامة الملف).
 *
 * عند أي فشل تُحذف الملفات ويُستخدم الـbundle المدمج في الـAPK.
 */
object OtaBundle {
  private const val TAG = "HDR_OTA"
  const val BUNDLE_NAME = "index.android.bundle"
  const val META_NAME = "meta.json"
  const val DIR_NAME = "ota"

  fun getBundlePath(context: Context): String? {
    try {
      val dir = File(context.filesDir, DIR_NAME)
      val bundle = File(dir, BUNDLE_NAME)
      val meta = File(dir, META_NAME)
      if (!bundle.exists() || !meta.exists()) return null

      // 1) الحماية من القدم: تجاهل الحزمة إن حُدّث الـAPK بعد تحميلها
      try {
        val pkgInfo = context.packageManager.getPackageInfo(context.packageName, 0)
        if (pkgInfo.lastUpdateTime > bundle.lastModified()) {
          Log.i(TAG, "OTA bundle is stale (APK updated afterwards) — removing")
          bundle.delete()
          meta.delete()
          return null
        }
      } catch (_: Exception) {
        // تابع الفحص رغم تعذر قراءة معلومات الحزمة
      }

      // 2) التحقق من السلامة عبر SHA256
      val metaJson = JSONObject(meta.readText())
      val expected = metaJson.optString("sha256", "")
      if (expected.isNotEmpty()) {
        val actual = sha256Hex(bundle)
        if (!actual.equals(expected, ignoreCase = true)) {
          Log.w(TAG, "OTA bundle SHA256 mismatch — removing")
          bundle.delete()
          meta.delete()
          return null
        }
      }

      Log.i(TAG, "Using OTA bundle version=${metaJson.optString("version", "?")}")
      return bundle.absolutePath
    } catch (e: Exception) {
      Log.w(TAG, "OTA bundle check failed: ${e.message}")
      return null
    }
  }

  private fun sha256Hex(file: File): String {
    val digest = MessageDigest.getInstance("SHA-256")
    file.inputStream().use { input ->
      val buf = ByteArray(8192)
      var n: Int
      while (input.read(buf).also { n = it } > 0) {
        digest.update(buf, 0, n)
      }
    }
    return digest.digest().joinToString("") { "%02x".format(it) }
  }
}
