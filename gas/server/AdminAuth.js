// ========================================================================
// AdminAuth.js — ตรวจ/เปลี่ยนรหัสผ่านแอดมิน (ใช้ร่วมกันทุกฟังก์ชันฝั่ง Admin)
// ========================================================================

/**
 * ตรวจรหัสผ่าน Admin จาก Script Properties (ถ้ายังไม่เคยตั้ง จะใช้ค่าเริ่มต้น DEFAULT_ADMIN_PASSWORD)
 */
function checkAdminPassword(password) {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty(PROP_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
  return String(password) === String(saved);
}

/**
 * เปลี่ยนรหัสผ่าน Admin (ต้องส่งรหัสเดิมมายืนยันก่อน)
 */
function changeAdminPassword(oldPassword, newPassword) {
  if (!checkAdminPassword(oldPassword)) {
    throw new Error('รหัสผ่านเดิมไม่ถูกต้อง');
  }
  if (!newPassword || String(newPassword).length < 4) {
    throw new Error('รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร');
  }
  PropertiesService.getScriptProperties().setProperty(PROP_PASSWORD_KEY, String(newPassword));
  return true;
}
