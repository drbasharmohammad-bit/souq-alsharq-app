/**
 * اختبارات منطق التحديث الهوائي (دوال خالصة — بلا اعتماد على native).
 */
import { compareVersions, OTA_RUNTIME, BUILT_IN_OTA_VERSION } from '../src/ota/otaConfig';

describe('compareVersions', () => {
  test('الأحدث تُرجع قيمة موجبة', () => {
    expect(compareVersions('1.0.1', '1.0.0')).toBeGreaterThan(0);
    expect(compareVersions('1.1.0', '1.0.9')).toBeGreaterThan(0);
    expect(compareVersions('2.0.0', '1.9.9')).toBeGreaterThan(0);
  });

  test('الأقدم تُرجع قيمة سالبة', () => {
    expect(compareVersions('1.0.0', '1.0.1')).toBeLessThan(0);
  });

  test('المتساوية تُرجع صفر', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
  });

  test('تتعامل مع أطوال مختلفة', () => {
    expect(compareVersions('1.0.1', '1.0')).toBeGreaterThan(0);
  });
});

describe('otaConfig', () => {
  test('ثوابت صالحة', () => {
    expect(OTA_RUNTIME).toBe('1');
    expect(BUILT_IN_OTA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
