// ========================================================================
// EmailImages.js — อัปโหลด/แสดงรายการรูปที่แนบอีเมล
// ========================================================================

function getEmailImageFolderId_() {
  return PropertiesService.getScriptProperties().getProperty(PROP_EMAIL_FOLDER_KEY) || DEFAULT_EMAIL_FOLDER_ID;
}

/**
 * ตั้งสิทธิ์ไฟล์ให้เป็น "ทุกคนที่มีลิงก์ดูได้" เพื่อให้ <img> โหลดรูปจาก Drive ได้ทั้งบนหน้าเว็บ Admin และในอีเมลที่ส่งออกไป
 * ถ้าตั้งไม่สำเร็จ (เช่นโดนนโยบายโดเมนบล็อก) จะไม่ throw error เพื่อไม่ให้การอัปโหลด/แสดงผลอื่นล้มเหลวไปด้วย
 */
function makeFilePublic_(file) {
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    // เพิกเฉย — บางโดเมน Google Workspace อาจจำกัดการแชร์แบบสาธารณะ
  }
}

/**
 * อัปโหลดรูปภาพที่แอดมินเลือก เก็บไว้ในโฟลเดอร์ Google Drive ที่กำหนดไว้ (ใช้แนบตอนส่งอีเมล)
 * base64Data: ข้อมูลรูปแบบ base64 (ไม่รวม prefix "data:image/...;base64,")
 */
function uploadEmailImage(password, base64Data, mimeType, fileName) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');
  if (!base64Data) throw new Error('ไม่พบข้อมูลรูปภาพ');

  const folder = DriveApp.getFolderById(getEmailImageFolderId_());
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(bytes, mimeType || 'image/png', fileName || ('email-image-' + new Date().getTime() + '.png'));
  const file = folder.createFile(blob);
  makeFilePublic_(file); // ต้องแชร์แบบสาธารณะ ไม่งั้นรูปจะโหลดไม่ขึ้นทั้งในหน้า Admin และในอีเมลที่ส่งออกไป

  return {
    fileId: file.getId(),
    name: file.getName(),
    url: toDirectImageUrl_(file.getId()),
    base64: base64Data,
    mimeType: mimeType || 'image/png'
  };
}

/**
 * แสดงรายการรูปที่เคยอัปโหลดไว้ในโฟลเดอร์ (ให้เลือกใช้ซ้ำได้โดยไม่ต้องอัปโหลดใหม่ทุกครั้ง)
 */
function listEmailImages(password) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');

  const folder = DriveApp.getFolderById(getEmailImageFolderId_());
  const it = folder.getFiles();
  const out = [];
  while (it.hasNext()) {
    const f = it.next();
    if (String(f.getMimeType()).indexOf('image/') === 0) {
      makeFilePublic_(f); // แก้ไฟล์เก่าที่อัปโหลดไว้ก่อนหน้านี้ให้โหลดรูปได้ด้วย
      out.push({
        fileId: f.getId(),
        name: f.getName(),
        url: toDirectImageUrl_(f.getId()),
        updated: f.getLastUpdated().getTime()
      });
    }
  }
  out.sort(function (a, b) { return b.updated - a.updated; });
  return out;
}
