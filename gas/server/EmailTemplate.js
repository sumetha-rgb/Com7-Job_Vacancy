// ========================================================================
// EmailTemplate.js — Template HTML ของอีเมล
// ใช้ร่วมกันทั้งตอน "ดูตัวอย่าง" และตอนส่งจริง
// ========================================================================

/**
 * ลิงก์รูปภาพ Google Drive แบบ Direct Image URL
 * เหมาะสำหรับใช้กับ <img> มากกว่า uc?export=view
 */
function toDirectImageUrl_(fileId) {
  return 'https://lh3.googleusercontent.com/d/' + fileId;
}

/**
 * Escape HTML ป้องกันอักขระพิเศษทำให้ HTML พัง
 */
function escapeHtml_(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * สร้าง HTML อีเมล
 *
 * opts:
 * {
 *   subject,
 *   bodyText,
 *   imageUrl,
 *   fromName
 * }
 */
function buildEmailHtml_(opts) {
  const subject = escapeHtml_(opts.subject || '');

  const bodyHtml = escapeHtml_(opts.bodyText || '')
    .replace(/\n/g, '<br>');

  const imageUrl = opts.imageUrl || '';

  const fromName = escapeHtml_(
    opts.fromName ||
    getBrevoSettings_().fromName ||
    'COM7 Recruitment'
  );

  /*
   * EMAIL_LOGO_URL ต้องเป็น URL รูปภาพโดยตรง
   *
   * ตัวอย่าง:
   * const EMAIL_LOGO_URL =
   *   'https://lh3.googleusercontent.com/d/FILE_ID';
   */
  const logoUrl = EMAIL_LOGO_URL || '';

  return '' +
    // ======================================================================
    // OUTER BACKGROUND
    // ======================================================================
    '<div style="' +
      'background:#eef2f0;' +
      'padding:24px 12px;' +
      'font-family:Segoe UI,Tahoma,Arial,sans-serif;' +
    '">' +

      // ====================================================================
      // MAIN EMAIL CARD
      // ====================================================================
      '<div style="' +
        'max-width:560px;' +
        'margin:0 auto;' +
        'background:#ffffff;' +
        'border-radius:14px;' +
        'overflow:hidden;' +
        'box-shadow:0 2px 12px rgba(0,0,0,0.06);' +
      '">' +

        // ==================================================================
        // HEADER
        // ==================================================================
        '<div style="' +
          'background:#ffffff;' +
          'padding:30px 26px 20px;' +
          'text-align:center;' +
          'border-bottom:3px solid #0f9d58;' +
        '">' +
          (
            logoUrl
              ? '<img ' +
                  'src="' + escapeHtml_(logoUrl) + '" ' +
                  'alt="' + fromName + '" ' +
                  'style="' +
                    'display:block;' +
                    'margin:0 auto;' +
                    'max-width:220px;' +
                    'max-height:60px;' +
                    'width:auto;' +
                    'height:auto;' +
                    'border:0;' +
                    'outline:none;' +
                    'text-decoration:none;' +
                  '"' +
                '>'
              : ''
          ) +
        '</div>' +

        // ==================================================================
        // CONTENT
        // ==================================================================
        '<div style="' +
          'padding:30px 26px 10px;' +
        '">' +

          // Subject
          '<div style="' +
            'font-size:17px;' +
            'font-weight:700;' +
            'color:#1a1a1a;' +
            'margin-bottom:16px;' +
            'line-height:1.5;' +
          '">' +
            subject +
          '</div>' +

          // Body
          '<div style="' +
            'font-size:14.5px;' +
            'line-height:1.8;' +
            'color:#3a3a3a;' +
            'word-break:break-word;' +
          '">' +
            bodyHtml +
          '</div>' +

          // ==================================================================
          // ATTACHED IMAGE
          // ==================================================================
          (
            imageUrl
              ? '<div style="' +
                  'margin-top:20px;' +
                  'text-align:center;' +
                '">' +
                  '<img ' +
                    'src="' + escapeHtml_(imageUrl) + '" ' +
                    'alt="รายละเอียดวันสัมภาษณ์" ' +
                    'style="' +
                      'display:block;' +
                      'margin:0 auto;' +
                      'max-width:100%;' +
                      'height:auto;' +
                      'border:0;' +
                      'border-radius:10px;' +
                    '"' +
                  '>' +
                '</div>'
              : ''
          ) +

          // ==================================================================
          // ACTION BUTTONS
          // ==================================================================
          '<div style="' +
            'margin-top:24px;' +
            'text-align:center;' +
          '">' +

            // สมัครงาน
            '<a ' +
              'href="' + escapeHtml_(APPLY_FORM_URL) + '" ' +
              'style="' +
                'display:inline-block;' +
                'background:#0f9d58;' +
                'color:#ffffff;' +
                'text-decoration:none;' +
                'font-size:14.5px;' +
                'font-weight:700;' +
                'padding:12px 30px;' +
                'border-radius:8px;' +
                'margin:0 6px 10px;' +
                'border:1px solid #0f9d58;' +
              '"' +
            '>' +
              'สนใจสมัครงาน' +
            '</a>' +

            // ตรวจสอบตำแหน่งงานว่าง
            '<a ' +
              'href="https://tinyurl.com/Com7-Job-Vacancy" ' +
              'style="' +
                'display:inline-block;' +
                'background:#ffffff;' +
                'color:#0f9d58;' +
                'text-decoration:none;' +
                'font-size:14.5px;' +
                'font-weight:700;' +
                'padding:11px 30px;' +
                'border-radius:8px;' +
                'border:1.5px solid #0f9d58;' +
                'margin:0 6px 10px;' +
              '"' +
            '>' +
              'ตรวจสอบตำแหน่งงานว่าง' +
            '</a>' +

          '</div>' +

        '</div>' +

        // ==================================================================
        // HR CONTACT CARD
        // ==================================================================
        '<div style="' +
          'padding:18px 26px 26px;' +
        '">' +

          '<div style="' +
            'background:#eef8f1;' +
            'border-left:4px solid #0f9d58;' +
            'border-radius:12px;' +
            'padding:20px 22px;' +
          '">' +

            // หัวข้อ
            '<div style="' +
              'font-size:15px;' +
              'font-weight:700;' +
              'color:#1a1a1a;' +
              'margin-bottom:10px;' +
            '">' +
              'ฝ่ายทรัพยากรบุคคล' +
            '</div>' +

            // รายละเอียด
            '<div style="' +
              'font-size:13.5px;' +
              'line-height:1.7;' +
              'color:#444444;' +
              'margin-bottom:12px;' +
            '">' +
              'ร่วมเป็นส่วนหนึ่งของบริษัท COM7 แค่เพียงคุณสมัครงานเข้ามาเพื่อคว้าโอกาสดีๆกับทางบริษัท' +
            '</div>' +

            // เบอร์โทร
            '<div style="' +
              'font-size:13.5px;' +
              'color:#1a1a1a;' +
              'font-weight:600;' +
              'margin-bottom:16px;' +
            '">' +
              '&#128222;&nbsp; 02-017-7777 ต่อ 7212, 7208, 7209, 7210' +
            '</div>' +

            // ==================================================================
            // SOCIAL ICONS
            // ใช้ PNG <img> แทน SVG เพื่อให้ Email Client รองรับได้ดีขึ้น
            // ==================================================================
            '<table ' +
              'role="presentation" ' +
              'cellpadding="0" ' +
              'cellspacing="0" ' +
              'border="0" ' +
              'align="left" ' +
            '>' +
              '<tr>' +

                // ==============================================================
                // FACEBOOK
                // ==============================================================
                '<td style="padding-right:10px;">' +
                  '<a ' +
                    'href="https://web.facebook.com/Comsevencareer" ' +
                    'style="text-decoration:none;"' +
                  '>' +
                    '<table ' +
                      'role="presentation" ' +
                      'cellpadding="0" ' +
                      'cellspacing="0" ' +
                      'border="0" ' +
                      'width="38" ' +
                      'height="38" ' +
                      'style="' +
                        'background:#ffffff;' +
                        'border:1px solid #e6e6e6;' +
                        'border-radius:11px;' +
                      '"' +
                    '>' +
                      '<tr>' +
                        '<td ' +
                          'align="center" ' +
                          'valign="middle" ' +
                        '>' +
                          '<img ' +
                            'src="https://img.icons8.com/color/48/facebook-new.png" ' +
                            'width="20" ' +
                            'height="20" ' +
                            'alt="Facebook" ' +
                            'style="' +
                              'display:block;' +
                              'width:20px;' +
                              'height:20px;' +
                              'border:0;' +
                              'outline:none;' +
                              'text-decoration:none;' +
                            '"' +
                          '>' +
                        '</td>' +
                      '</tr>' +
                    '</table>' +
                  '</a>' +
                '</td>' +

                // ==============================================================
                // INSTAGRAM
                // ==============================================================
                '<td style="padding-right:10px;">' +
                  '<a ' +
                    'href="https://www.instagram.com/comsevencareer" ' +
                    'style="text-decoration:none;"' +
                  '>' +
                    '<table ' +
                      'role="presentation" ' +
                      'cellpadding="0" ' +
                      'cellspacing="0" ' +
                      'border="0" ' +
                      'width="38" ' +
                      'height="38" ' +
                      'style="' +
                        'background:#ffffff;' +
                        'border:1px solid #e6e6e6;' +
                        'border-radius:11px;' +
                      '"' +
                    '>' +
                      '<tr>' +
                        '<td ' +
                          'align="center" ' +
                          'valign="middle" ' +
                        '>' +
                          '<img ' +
                            'src="https://img.icons8.com/fluency/48/instagram-new.png" ' +
                            'width="20" ' +
                            'height="20" ' +
                            'alt="Instagram" ' +
                            'style="' +
                              'display:block;' +
                              'width:20px;' +
                              'height:20px;' +
                              'border:0;' +
                              'outline:none;' +
                              'text-decoration:none;' +
                            '"' +
                          '>' +
                        '</td>' +
                      '</tr>' +
                    '</table>' +
                  '</a>' +
                '</td>' +

                // ==============================================================
                // LINE
                // ==============================================================
                '<td style="padding-right:10px;">' +
                  '<a ' +
                    'href="https://page.line.me/comsevencareer" ' +
                    'style="text-decoration:none;"' +
                  '>' +
                    '<table ' +
                      'role="presentation" ' +
                      'cellpadding="0" ' +
                      'cellspacing="0" ' +
                      'border="0" ' +
                      'width="38" ' +
                      'height="38" ' +
                      'style="' +
                        'background:#ffffff;' +
                        'border:1px solid #e6e6e6;' +
                        'border-radius:11px;' +
                      '"' +
                    '>' +
                      '<tr>' +
                        '<td ' +
                          'align="center" ' +
                          'valign="middle" ' +
                        '>' +
                          '<img ' +
                            'src="https://img.icons8.com/color/48/line-me.png" ' +
                            'width="20" ' +
                            'height="20" ' +
                            'alt="LINE" ' +
                            'style="' +
                              'display:block;' +
                              'width:20px;' +
                              'height:20px;' +
                              'border:0;' +
                              'outline:none;' +
                              'text-decoration:none;' +
                            '"' +
                          '>' +
                        '</td>' +
                      '</tr>' +
                    '</table>' +
                  '</a>' +
                '</td>' +

                // ==============================================================
                // TIKTOK
                // ==============================================================
                '<td>' +
                  '<a ' +
                    'href="https://www.tiktok.com/@comsevencareer" ' +
                    'style="text-decoration:none;"' +
                  '>' +
                    '<table ' +
                      'role="presentation" ' +
                      'cellpadding="0" ' +
                      'cellspacing="0" ' +
                      'border="0" ' +
                      'width="38" ' +
                      'height="38" ' +
                      'style="' +
                        'background:#ffffff;' +
                        'border:1px solid #e6e6e6;' +
                        'border-radius:11px;' +
                      '"' +
                    '>' +
                      '<tr>' +
                        '<td ' +
                          'align="center" ' +
                          'valign="middle" ' +
                        '>' +
                          '<img ' +
                            'src="https://img.icons8.com/color/48/tiktok.png" ' +
                            'width="20" ' +
                            'height="20" ' +
                            'alt="TikTok" ' +
                            'style="' +
                              'display:block;' +
                              'width:20px;' +
                              'height:20px;' +
                              'border:0;' +
                              'outline:none;' +
                              'text-decoration:none;' +
                            '"' +
                          '>' +
                        '</td>' +
                      '</tr>' +
                    '</table>' +
                  '</a>' +
                '</td>' +

              '</tr>' +
            '</table>' +

            // Clear float
            '<div style="clear:both;"></div>' +

          '</div>' +

        '</div>' +

      '</div>' +

      // ======================================================================
      // COPYRIGHT
      // ======================================================================
      '<div style="' +
        'max-width:560px;' +
        'margin:0 auto;' +
        'background:#0f9d58;' +
        'background:linear-gradient(90deg,#0f9d58,#00c766);' +
        'padding:14px 24px;' +
        'text-align:center;' +
        'border-radius:0 0 14px 14px;' +
      '">' +
        '<span style="' +
          'color:#ffffff;' +
          'font-size:12px;' +
        '">' +
          '&copy; ' +
          new Date().getFullYear() +
          ' Comseven Public Company Limited' +
        '</span>' +
      '</div>' +

    '</div>';
}