// ========================================================================
// EmailSheetConfig.js — จัดการลิงก์ Google Sheet ฐานข้อมูล "ผู้สมัคร" (สำหรับส่งอีเมลยืนยันสัมภาษณ์)
// ให้แอดมินวางลิงก์เองจากหน้า Admin ได้เลย ไม่ต้องจำกัดแค่ค่าที่ fix ไว้ในโค้ด (Config.js)
// รูปแบบเดียวกับ AdminSheetConfig.js (ที่ใช้กับลิงก์ตำแหน่งงานว่าง) แต่แยกเก็บคนละ property key
// ========================================================================

/**
 * อ่านลิงก์ที่แอดมินเคยตั้งเองไว้ (ถ้ามี) จาก Script Properties
 * คืนค่า null ถ้ายังไม่เคยตั้ง (หมายถึงกำลังใช้ค่าเริ่มต้นในโค้ด DEFAULT_EMAIL_SHEET_ID/GID)
 */
function getStoredEmailSheetConfig_() {
  const props = PropertiesService.getScriptProperties();
  const stored = props.getProperty(PROP_EMAIL_SHEET_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (!parsed || !parsed.sheetId) return null;
    return { sheetId: String(parsed.sheetId), gid: Number(parsed.gid) || 0, raw: parsed.raw || '' };
  } catch (e) {
    return null;
  }
}

/**
 * คืนค่าลิงก์ชีทผู้สมัครที่ "ใช้งานอยู่จริง" ตอนนี้ (ที่แอดมินตั้งเอง หรือค่าเริ่มต้นในโค้ดถ้ายังไม่เคยแก้)
 */
function getEffectiveEmailSheetConfig_() {
  const stored = getStoredEmailSheetConfig_();
  if (stored) return stored;
  return { sheetId: DEFAULT_EMAIL_SHEET_ID, gid: DEFAULT_EMAIL_SHEET_GID, raw: '' };
}

/**
 * แกะ Sheet ID + gid จากลิงก์ Google Sheet ทั่วไปที่แอดมินวางมา (ลิงก์แชร์/แก้ไข/export csv/Sheet ID เปล่าๆ ก็รองรับ)
 * คืน null ถ้าแกะไม่ได้ (ลิงก์ไม่ถูกต้อง)
 */
function parseSheetLink_(rawInput) {
  const input = String(rawInput || '').trim();
  if (!input) return null;

  let sheetId = null;
  const idMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch) {
    sheetId = idMatch[1];
  } else if (/^[a-zA-Z0-9-_]{20,}$/.test(input)) {
    sheetId = input; // วาง Sheet ID เปล่าๆ มาตรงๆ
  }
  if (!sheetId) return null;

  const gidMatch = input.match(/[?#&]gid=([0-9]+)/);
  const gid = gidMatch ? Number(gidMatch[1]) : 0;

  return { sheetId: sheetId, gid: gid, raw: input };
}

/**
 * ให้หน้า Admin โหลดสถานะปัจจุบันไปแสดง (ไม่ต้องใส่รหัสผ่านก่อน เพราะไม่ใช่ข้อมูลลับ แค่ลิงก์ชีทที่ระบบดึงอยู่)
 */
function getEmailSheetStatus() {
  const cfg = getEffectiveEmailSheetConfig_();
  const editUrl = 'https://docs.google.com/spreadsheets/d/' + cfg.sheetId + '/edit#gid=' + cfg.gid;
  return {
    isUsingDefault: !getStoredEmailSheetConfig_(),
    sheetUrl: editUrl,
    raw: cfg.raw || editUrl
  };
}

/**
 * บันทึกลิงก์ Google Sheet ผู้สมัครใหม่ (ต้องใส่รหัสผ่าน Admin ให้ถูกต้อง)
 * แอดมินวางลิงก์ธรรมดา (แชร์/แก้ไข) จาก Google Sheet ได้เลย ระบบจะแกะ Sheet ID + gid ให้เอง
 */
function saveEmailSheetLink(password, rawLink) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');

  const parsed = parseSheetLink_(rawLink);
  if (!parsed) throw new Error('ลิงก์ไม่ถูกต้อง กรุณาวางลิงก์ Google Sheet ที่แชร์แบบปกติ หรือ Sheet ID');

  PropertiesService.getScriptProperties().setProperty(PROP_EMAIL_SHEET_KEY, JSON.stringify(parsed));
  return getEmailSheetStatus();
}

/**
 * ลบลิงก์ที่แอดมินตั้งเอง กลับไปใช้ค่าเริ่มต้นในโค้ด
 */
function resetEmailSheetLink(password) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');
  PropertiesService.getScriptProperties().deleteProperty(PROP_EMAIL_SHEET_KEY);
  return getEmailSheetStatus();
}