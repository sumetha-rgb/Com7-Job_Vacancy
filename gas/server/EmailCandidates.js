// ========================================================================
// EmailCandidates.js — อ่านรายชื่อผู้สมัคร (จากชีทฐานข้อมูล) และทดสอบการเชื่อมต่อ
// ใช้โดยแท็บ "ส่งอีเมล" ในหน้า Admin
// ========================================================================

function normalizeHeaderText_(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function getEmailSheet_() {
  const cfg = getEffectiveEmailSheetConfig_();
  const ss = SpreadsheetApp.openById(cfg.sheetId);
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === cfg.gid) return sheets[i];
  }
  return sheets[0]; // fallback: แท็บแรกถ้าหา gid ไม่เจอ
}

/**
 * เปิดแท็บชีท "บันทึกผล" (log) สำหรับคนที่ส่งอีเมลสำเร็จแล้ว
 * ถ้ายังไม่มีหัวตาราง (ชื่อ-สกุล / E-mail / สถานะ) จะสร้างให้อัตโนมัติ
 */
function getEmailLogSheet_() {
  const cfg = getEffectiveEmailSheetConfig_();
  const ss = SpreadsheetApp.openById(cfg.sheetId);
  const sheets = ss.getSheets();
  let sheet = null;
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === EMAIL_LOG_SHEET_GID) { sheet = sheets[i]; break; }
  }
  if (!sheet) throw new Error('ไม่พบแท็บชีทบันทึกผล (gid ' + EMAIL_LOG_SHEET_GID + ') กรุณาตรวจสอบ EMAIL_LOG_SHEET_GID ใน Config.js');

  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, EMAIL_LOG_HEADERS.length).setValues([EMAIL_LOG_HEADERS]);
  }
  return sheet;
}

/**
 * บันทึก/อัปเดตแถวของผู้ที่ส่งอีเมลสำเร็จแล้วลงชีท log (ชื่อ-สกุล, E-mail, สถานะ)
 * ถ้าอีเมลนี้เคยมีแถวอยู่แล้วจะอัปเดตแถวเดิมแทนการเพิ่มซ้ำ
 */
function logEmailSent_(name, email, statusText) {
  const sheet = getEmailLogSheet_();
  const lastRow = sheet.getLastRow();
  const emailNorm = String(email || '').trim().toLowerCase();

  if (lastRow > 1) {
    const emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues(); // คอลัมน์ B = E-mail
    for (let i = 0; i < emails.length; i++) {
      if (String(emails[i][0] || '').trim().toLowerCase() === emailNorm) {
        sheet.getRange(i + 2, 1, 1, 3).setValues([[name || '', email || '', statusText || '']]);
        return;
      }
    }
  }
  sheet.appendRow([name || '', email || '', statusText || '']);
}

function findEmailColIndexes_(header) {
  const idx = {};
  Object.keys(EMAIL_COL).forEach(function (key) {
    const target = normalizeHeaderText_(EMAIL_COL[key]);
    let found = -1;
    for (let i = 0; i < header.length; i++) {
      if (normalizeHeaderText_(header[i]) === target) { found = i; break; }
    }
    idx[key] = found;
  });
  return idx;
}

/**
 * ดึงรายชื่อผู้สมัคร (ชื่อ-สกุล, E-mail, สถานะส่งเมล์) จากชีทฐานข้อมูล
 * ใช้แสดงในตารางหน้า "ส่งอีเมลยืนยัน" — ต้องใส่รหัสผ่านแอดมินก่อน
 */
function getEmailCandidates(password) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');

  const sheet = getEmailSheet_();
  const data = sheet.getDataRange().getValues();
  if (!data.length) return [];

  const header = data[0];
  const idx = findEmailColIndexes_(header);
  if (idx.NAME < 0 || idx.EMAIL < 0) {
    throw new Error('ไม่พบคอลัมน์ "ชื่อ-สกุล" หรือ "E-mail" ในชีท กรุณาตรวจสอบหัวตาราง');
  }

  const list = [];
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const name = String(row[idx.NAME] || '').trim();
    const email = String(row[idx.EMAIL] || '').trim();
    if (!name && !email) continue; // ข้ามแถวว่าง

    const statusRaw = idx.STATUS >= 0 ? String(row[idx.STATUS] || '').trim() : '';
    list.push({
      row: r + 1, // เลขแถวจริงในชีท (นับ header เป็นแถว 1)
      name: name,
      email: email,
      sent: statusRaw.indexOf(EMAIL_SENT_VALUE) === 0,
      statusText: statusRaw.indexOf(EMAIL_SENT_VALUE) === 0 ? statusRaw : EMAIL_NOT_SENT_VALUE
    });
  }
  return list;
}

/**
 * ทดสอบดึงข้อมูลจากชีทฐานข้อมูลผู้สมัคร ก่อนใช้งานจริง (กด "ทดสอบดึงข้อมูล" ที่หน้า Admin)
 * ตรวจว่าเปิดชีทได้ไหม, หาคอลัมน์ที่ต้องใช้เจอครบไหม แล้วสรุปจำนวนแถวที่อ่านได้กลับไปให้ดู
 */
function testEmailSheetConnection(password) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');

  let sheet;
  try {
    sheet = getEmailSheet_();
  } catch (e) {
    throw new Error('เปิดชีทไม่สำเร็จ (ตรวจสอบว่าแชร์สิทธิ์ให้บัญชีที่รัน Apps Script แล้ว): ' + e);
  }

  const data = sheet.getDataRange().getValues();
  if (!data.length) {
    return { ok: false, sheetName: sheet.getName(), totalRows: 0, missingColumns: Object.keys(EMAIL_COL), message: 'ชีทว่างเปล่า ไม่พบแม้แต่แถวหัวตาราง' };
  }

  const header = data[0];
  const idx = findEmailColIndexes_(header);
  const missing = Object.keys(EMAIL_COL).filter(function (key) { return idx[key] < 0; });

  let dataRows = 0;
  let sentCount = 0;
  for (let r = 1; r < data.length; r++) {
    const name = idx.NAME >= 0 ? String(data[r][idx.NAME] || '').trim() : '';
    const email = idx.EMAIL >= 0 ? String(data[r][idx.EMAIL] || '').trim() : '';
    if (!name && !email) continue;
    dataRows++;
    const statusRaw = idx.STATUS >= 0 ? String(data[r][idx.STATUS] || '').trim() : '';
    if (statusRaw.indexOf(EMAIL_SENT_VALUE) === 0) sentCount++;
  }

  return {
    ok: missing.indexOf('NAME') === -1 && missing.indexOf('EMAIL') === -1,
    sheetName: sheet.getName(),
    totalRows: dataRows,
    sentCount: sentCount,
    notSentCount: dataRows - sentCount,
    missingColumns: missing.map(function (key) { return EMAIL_COL[key]; })
  };
}