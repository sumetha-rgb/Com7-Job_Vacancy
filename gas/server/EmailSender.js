// ========================================================================
// EmailSender.js — ส่งอีเมลจริงให้ผู้สมัคร (ผ่าน Brevo API หรือ Gmail ตามค่าใน Config)
// ========================================================================

/**
 * ส่งอีเมล 1 ฉบับผ่าน Brevo API (ใช้เมื่อมีการตั้งค่า API Key ไว้ใน Config)
 */
function sendViaBrevo_(apiKey, fromEmail, fromName, toEmail, toName, subject, personalizedText, htmlBody) {
  const payload = {
    sender: { email: fromEmail, name: fromName || 'COM7 Recruitment' },
    to: [{ email: toEmail, name: toName || toEmail }],
    subject: subject,
    htmlContent: htmlBody,
    textContent: personalizedText
  };

  const response = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'api-key': apiKey, 'accept': 'application/json' },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error('Brevo error ' + status + ': ' + response.getContentText());
  }
}

/**
 * ส่งอีเมลยืนยัน (พร้อมแนบรูป ถ้ามี) ให้ผู้สมัครตามแถวที่เลือก แล้วอัปเดตสถานะกลับลงชีททันที
 * rowNumbers: array ของเลขแถวจริงในชีท (ได้มาจาก getEmailCandidates -> field "row")
 * imageInfo: null หรือ { fileId } — รูปที่จะแนบ (ดึงจาก Drive ตาม fileId ที่อัปโหลดไว้)
 * คืนค่า { summary: { sent, failed, provider }, results: [...] }
 *
 * ข้อความและหัวข้อใช้จาก EMAIL_SUBJECT / EMAIL_BODY_TEMPLATE ใน Config.js เท่านั้น
 */
function sendVacancyEmails(password, rowNumbers, imageInfo) {
  if (!checkAdminPassword(password)) throw new Error('รหัสผ่านไม่ถูกต้อง');
  if (!rowNumbers || !rowNumbers.length) throw new Error('กรุณาเลือกรายชื่ออย่างน้อย 1 คน');

  const subject = EMAIL_SUBJECT;
  const message = EMAIL_BODY_TEMPLATE;
  if (!subject) throw new Error('ยังไม่ได้ตั้งหัวข้ออีเมลใน Config');
  if (!message) throw new Error('ยังไม่ได้ตั้งเนื้อหาอีเมลใน Config');

  const sheet = getEmailSheet_();
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idx = findEmailColIndexes_(header);
  if (idx.EMAIL < 0) throw new Error('ไม่พบคอลัมน์ E-mail ในชีท');
  if (idx.STATUS < 0) throw new Error('ไม่พบคอลัมน์ "สถานะส่งเมล์" ในชีท');

  let imageUrl = '';
  let imageBlob = null; // ยังใช้แนบแบบ inline ตอนส่งผ่าน Gmail
  const fileId = imageInfo && imageInfo.fileId;
  if (fileId) {
    const imgFile = DriveApp.getFileById(fileId);
    makeFilePublic_(imgFile); // กันเคสไฟล์เก่ายังไม่ได้แชร์สาธารณะ
    imageUrl = toDirectImageUrl_(fileId);
    imageBlob = imgFile.getBlob();
  }

  const brevo = getBrevoSettings_();
  const brevoKey = brevo.apiKey.trim();
  const fromEmail = brevo.fromEmail.trim();
  const fromName = brevo.fromName || 'COM7 Recruitment';
  const useBrevo = !!(brevoKey && fromEmail);
  const provider = useBrevo ? 'brevo' : 'gmail';

  const nowStr = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm');
  const results = [];
  let sentCount = 0;
  let failedCount = 0;

  rowNumbers.forEach(function (rowNum) {
    const row = Number(rowNum);
    try {
      const rowValues = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
      const name = idx.NAME >= 0 ? String(rowValues[idx.NAME] || '').trim() : '';
      const email = String(rowValues[idx.EMAIL] || '').trim();
      if (!email) throw new Error('แถวนี้ไม่มีอีเมล');

      const personalizedText = String(message).replace(/\{ชื่อ\}/g, name || '');
      const htmlBody = buildEmailHtml_({
        subject: subject,
        bodyText: personalizedText,
        imageUrl: imageUrl,
        fromName: fromName
      });

      if (useBrevo) {
        sendViaBrevo_(brevoKey, fromEmail, fromName, email, name, subject, personalizedText, htmlBody);
      } else {
        const sendOptions = { htmlBody: htmlBody, name: fromName || 'COM7 Recruitment' };
        if (imageBlob) sendOptions.inlineImages = { vacancyImageFallback: imageBlob };
        GmailApp.sendEmail(email, subject, personalizedText, sendOptions);
      }

      const statusText = EMAIL_SENT_VALUE + ' (' + nowStr + ')';
      sheet.getRange(row, idx.STATUS + 1).setValue(statusText);
      try {
        logEmailSent_(name, email, statusText); // บันทึกซ้ำไว้ในชีท log (คนละแท็บ) ด้วย
      } catch (logErr) {
        // ไม่ให้การบันทึก log ล้มเหลวไปทำให้ผลส่งอีเมลที่สำเร็จแล้วกลายเป็น "ไม่สำเร็จ"
        Logger.log('บันทึก log ไม่สำเร็จสำหรับ ' + email + ': ' + logErr);
      }
      sentCount++;
      results.push({ row: row, name: name, email: email, ok: true, statusText: statusText });
    } catch (err) {
      failedCount++;
      results.push({ row: row, ok: false, error: String(err) });
    }
  });

  return {
    summary: { sent: sentCount, failed: failedCount, provider: provider },
    results: results
  };
}