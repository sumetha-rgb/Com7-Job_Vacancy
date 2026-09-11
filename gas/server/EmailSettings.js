// ========================================================================
// EmailSettings.js — สร้าง HTML ตัวอย่างก่อนส่ง (ข้อความจาก Config + รูปที่แอดมินอัปโหลด)
// และจัดการค่าตั้งค่าผู้ส่งอีเมล Brevo (เก็บใน Script Properties เท่านั้น ไม่มีใน source code)
// ========================================================================

/**
 * อ่านค่า Brevo API Key / Sender ปัจจุบันจาก Script Properties (ไม่เคยอยู่ในโค้ด)
 */
function getBrevoSettings_() {
  const props = PropertiesService.getScriptProperties();
  return {
    apiKey: props.getProperty(PROP_BREVO_API_KEY) || '',
    fromEmail: props.getProperty(PROP_BREVO_FROM_EMAIL) || '',
    fromName: props.getProperty(PROP_BREVO_FROM_NAME) || DEFAULT_BREVO_FROM_NAME
  };
}

/**
 * คืนค่าข้อความอีเมลที่ระบบเตรียมไว้ (สำหรับแสดงในหน้า Admin)
 * hasApiKey / provider ใช้บอกสถานะเท่านั้น — ไม่คืนค่าคีย์จริงกลับไปที่ฝั่ง client
 */
function getEmailTemplateContent(password) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');
  const brevo = getBrevoSettings_();
  return {
    subject: EMAIL_SUBJECT,
    bodyTemplate: EMAIL_BODY_TEMPLATE,
    fromName: brevo.fromName,
    fromEmail: brevo.fromEmail,
    hasApiKey: !!brevo.apiKey.trim(),
    provider: (brevo.apiKey.trim() && brevo.fromEmail) ? 'brevo' : 'gmail'
  };
}

/**
 * ให้หน้า Admin โหลดไปแสดงในฟอร์มตั้งค่า Brevo — ส่ง apiKeyMasked (ไม่ใช่คีย์เต็ม) เพื่อความปลอดภัย
 */
function getBrevoSettingsForAdmin(password) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');
  const brevo = getBrevoSettings_();
  const key = brevo.apiKey.trim();
  return {
    fromEmail: brevo.fromEmail,
    fromName: brevo.fromName,
    hasApiKey: !!key,
    apiKeyMasked: key ? (key.slice(0, 6) + '••••••••' + key.slice(-4)) : ''
  };
}

/**
 * บันทึกค่าตั้งค่า Brevo ใหม่ (อีเมลผู้ส่ง / ชื่อผู้ส่ง) ลง Script Properties
 * apiKey: ถ้าไม่ส่งมา (undefined/null) จะ "คงคีย์เดิมไว้" — ไม่ทับด้วยค่าว่าง เพราะหน้า Admin จะโชว์คีย์แบบ mask เท่านั้น
 *         ถ้าต้องการลบคีย์จริงๆ ให้เรียก clearBrevoApiKey() แยกต่างหาก
 */
function saveBrevoSettings(password, apiKey, fromEmail, fromName) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');

  const props = PropertiesService.getScriptProperties();
  const email = String(fromEmail || '').trim();
  const name = String(fromName || '').trim() || DEFAULT_BREVO_FROM_NAME;

  if (apiKey !== undefined && apiKey !== null && String(apiKey).trim()) {
    props.setProperty(PROP_BREVO_API_KEY, String(apiKey).trim());
  }
  props.setProperty(PROP_BREVO_FROM_EMAIL, email);
  props.setProperty(PROP_BREVO_FROM_NAME, name);

  return getBrevoSettingsForAdmin(password);
}

/**
 * ลบ Brevo API Key ที่บันทึกไว้ทิ้ง (ระบบจะกลับไปส่งอีเมลผ่าน Gmail แทนโดยอัตโนมัติ)
 */
function clearBrevoApiKey(password) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');
  PropertiesService.getScriptProperties().deleteProperty(PROP_BREVO_API_KEY);
  return getBrevoSettingsForAdmin(password);
}

/**
 * สร้าง HTML อีเมลตัวอย่างจาก Template เดียวกับที่ใช้ส่งจริง
 * ใช้แสดงในหน้าต่าง "ดูตัวอย่างก่อนส่ง"
 * imageUrl: URL ของรูปที่แอดมินอัปโหลด (ถ้ามี)
 * sampleName: ชื่อตัวอย่างสำหรับแทนที่ {ชื่อ}
 */
function renderEmailPreviewHtml(password, imageUrl, sampleName) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');

  const personalizedText = String(EMAIL_BODY_TEMPLATE || '').replace(/\{ชื่อ\}/g, sampleName || '');
  return buildEmailHtml_({
    subject: EMAIL_SUBJECT,
    bodyText: personalizedText,
    imageUrl: imageUrl || '',
    fromName: getBrevoSettings_().fromName
  });
}