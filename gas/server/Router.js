// ========================================================================
// Router.js — จุดเข้าเว็บแอป (doGet) ตัดสินใจว่าจะแสดงหน้าไหน
// ========================================================================

/**
 * Router หลักของเว็บแอป
 * - ไม่มี parameter หรือ ?page=home  -> หน้าค้นหาตำแหน่งงาน (Index)
 * - ?page=admin                     -> หน้าแก้ไขฐานข้อมูล / ส่งอีเมล (Admin)
 */
function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) ? String(e.parameter.page) : 'home';
  const faviconUrl = 'https://drive.google.com/uc?export=view&id=1olsp8TIPaP7xTZhLmzEjjdjp-5oWmezr&.png';

  if (page === 'admin') {
    return HtmlService.createHtmlOutputFromFile('client/Admin')
      .setTitle('Admin - จัดการฐานข้อมูลตำแหน่งงาน')
      .setFaviconUrl(faviconUrl)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  return HtmlService.createHtmlOutputFromFile('client/Index')
    .setTitle('ค้นหาตำแหน่งงานว่างบริษัทคอมเซเว่น')
    .setFaviconUrl(faviconUrl)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * ส่งค่าคงที่ที่ฝั่ง client (Index.html) ต้องใช้ เช่น ลิงก์ฟอร์มสมัครงาน
 */
function getClientConfig() {
  return {
    applyFormUrl: APPLY_FORM_URL,
    lineContactUrl: LINE_CONTACT_URL
  };
}
