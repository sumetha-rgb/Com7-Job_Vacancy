// ========================================================================
// AdminSheetConfig.js — จัดการลิสต์ลิงก์ Google Sheet (CSV) ที่ใช้ดึงข้อมูลตำแหน่งงาน
// ใช้โดยแท็บ "ฐานข้อมูล" ในหน้า Admin
// ========================================================================

/**
 * อ่านรายการที่เก็บไว้ใน Script Properties แบบดิบ คืนเป็น array ของ { raw, csvUrl }
 * รองรับข้อมูลเก่าที่เคยเก็บเป็น array ของ string ล้วนๆ ด้วย (เพื่อความเข้ากันได้ย้อนหลัง)
 * คืนค่า null ถ้ายังไม่เคยตั้งค่าอะไรเลย (หมายถึงกำลังใช้ค่าเริ่มต้นจากโค้ด)
 */
function getStoredConfigItems_() {
  const props = PropertiesService.getScriptProperties();
  const stored = props.getProperty(PROP_URLS_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.length) return null;

    return parsed.map(function (entry) {
      if (typeof entry === 'string') return { name: '', raw: entry, csvUrl: entry };
      return {
        name: entry.name || '',
        raw: entry.raw || entry.csvUrl,
        csvUrl: entry.csvUrl || entry.raw
      };
    }).filter(function (it) { return !!it.csvUrl; });
  } catch (e) {
    return null;
  }
}

/**
 * คืนรายการลิงก์ปัจจุบันเสมอ (ทั้งที่บันทึกเองไว้ หรือค่าเริ่มต้นในโค้ดถ้ายังไม่เคยแก้อะไรเลย)
 * ใช้เป็นฐานสำหรับฟังก์ชันแก้ไข/ลบ/เพิ่ม เพื่อไม่ให้ลิงก์เริ่มต้นหายไปเฉยๆ ตอนแก้แค่บางรายการ
 */
function getEffectiveConfigItems_() {
  const stored = getStoredConfigItems_();
  if (stored) return stored;
  return DEFAULT_CSV_URLS.map(function (u, i) {
    return { name: DEFAULT_CSV_NAMES[i] || '', raw: u, csvUrl: u };
  });
}

/**
 * บันทึกรายการ { raw, csvUrl } ลง Script Properties
 * ถ้ารายการว่างเปล่า ให้ลบค่าที่ตั้งไว้ทิ้งไปเลย (กลับไปใช้ค่าเริ่มต้นในโค้ดอัตโนมัติ)
 */
function saveStoredConfigItems_(items) {
  const props = PropertiesService.getScriptProperties();
  if (!items || !items.length) {
    props.deleteProperty(PROP_URLS_KEY);
  } else {
    props.setProperty(PROP_URLS_KEY, JSON.stringify(items));
  }
}

/**
 * อ่านลิสต์ CSV URL ปัจจุบัน (จาก Script Properties ถ้ามี ไม่งั้นใช้ค่าเริ่มต้น)
 */
function getCurrentCsvUrls() {
  const items = getStoredConfigItems_();
  if (items) return items.map(function (it) { return it.csvUrl; });
  return DEFAULT_CSV_URLS.slice();
}

/**
 * แปลงลิงก์ Google Sheet ทั่วไปให้เป็นลิงก์ "เปิดดู/แก้ไข" (ไม่ใช่ลิงก์ export CSV) เพื่อโชว์เป็นปุ่ม "เปิด Google Sheet"
 */
function toSheetEditUrl_(rawOrCsvUrl) {
  const input = String(rawOrCsvUrl || '');
  const idMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return input;
  const gidMatch = input.match(/[?#&]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';
  return 'https://docs.google.com/spreadsheets/d/' + idMatch[1] + '/edit#gid=' + gid;
}

/**
 * แปลงลิงก์ Google Sheet ทั่วไป (ลิงก์แชร์/แก้ไข) ให้เป็นลิงก์ export CSV โดยอัตโนมัติ
 * รองรับ:
 *  - https://docs.google.com/spreadsheets/d/<ID>/edit#gid=<GID>
 *  - https://docs.google.com/spreadsheets/d/<ID>/edit?usp=sharing
 *  - https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID> (ผ่านมาแล้วก็คืนค่าเดิม)
 *  - วาง Sheet ID เปล่าๆ มาตรงๆ ก็ได้เช่นกัน
 */
function convertToCsvUrl(rawInput) {
  const input = String(rawInput || '').trim();
  if (!input) return null;

  // ถ้าเป็นลิงก์ export csv อยู่แล้ว ใช้ตามเดิม
  if (/\/export\?.*format=csv/.test(input)) {
    return input;
  }

  let sheetId = null;
  let gid = '0';

  const idMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch) {
    sheetId = idMatch[1];
  } else if (/^[a-zA-Z0-9-_]{20,}$/.test(input)) {
    // ผู้ใช้อาจวาง Sheet ID มาตรงๆ โดยไม่มี URL ล้อมรอบ
    sheetId = input;
  }

  if (!sheetId) return null;

  const gidMatch = input.match(/[?#&]gid=([0-9]+)/);
  if (gidMatch) gid = gidMatch[1];

  return 'https://docs.google.com/spreadsheets/d/' + sheetId + '/export?format=csv&gid=' + gid;
}

/**
 * รับข้อความหลายบรรทัด (ลิงก์ Google Sheet ปกติ บรรทัดละ 1 ลิงก์) แล้วแปลงเป็นลิงก์ CSV
 * ให้ preview ที่หน้า Admin ก่อนกดบันทึกจริง
 */
function previewCsvConversion(rawInput) {
  // รองรับทั้งกรณีส่งมาเป็น array ของลิงก์ (จาก popup เพิ่มลิงก์) และข้อความหลายบรรทัด
  const lines = Array.isArray(rawInput)
    ? rawInput.map(function (l) { return String(l || '').trim(); }).filter(Boolean)
    : String(rawInput || '')
        .split(/\r?\n/)
        .map(function (l) { return l.trim(); })
        .filter(Boolean);

  return lines.map(function (line) {
    const converted = convertToCsvUrl(line);
    return { input: line, csvUrl: converted, valid: !!converted };
  });
}

/**
 * บันทึกลิสต์ CSV URL ใหม่ (ต้องใส่รหัสผ่าน Admin ให้ถูกต้อง)
 * rawText: ข้อความหลายบรรทัด วางลิงก์ Google Sheet ปกติ (หรือ export csv ก็ได้) บรรทัดละ 1 ลิงก์
 */
function saveAdminUrls(password, rawText) {
  if (!checkAdminPassword(password)) {
    throw new Error('รหัสผ่านไม่ถูกต้อง');
  }

  const results = previewCsvConversion(rawText);
  const invalid = results.filter(function (r) { return !r.valid; });
  if (invalid.length) {
    throw new Error('พบลิงก์ที่แปลงไม่ได้ ' + invalid.length + ' บรรทัด กรุณาตรวจสอบอีกครั้ง');
  }
  if (!results.length) {
    throw new Error('กรุณาวางลิงก์อย่างน้อย 1 ลิงก์');
  }

  const urls = results.map(function (r) { return r.csvUrl; });
  PropertiesService.getScriptProperties().setProperty(PROP_URLS_KEY, JSON.stringify(urls));

  // ล้าง cache ทันทีเพื่อให้หน้าเว็บหลักดึงข้อมูลจากแหล่งใหม่รอบถัดไป
  refreshVacancyData();

  return urls;
}

/**
 * ให้หน้า Admin โหลดสถานะปัจจุบันไปแสดง (ลิสต์ URL ปัจจุบัน) โดยไม่ต้องใส่รหัสผ่านก่อน
 * (ไม่ใช่ข้อมูลลับ เป็นแค่ลิงก์ชีทที่ระบบดึงอยู่)
 * แต่ละ item มี "row" = ตำแหน่งลำดับของลิงก์นั้น ใช้อ้างอิงตอนกดลบ
 */
function getAdminStatus() {
  const items = getEffectiveConfigItems_();

  return {
    isUsingDefault: !getStoredConfigItems_(),
    configSheetUrl: items.length ? toSheetEditUrl_(items[0].raw) : '',
    items: items.map(function (it, i) {
      return { name: it.name || '', raw: it.raw, row: i };
    })
  };
}

/**
 * เพิ่มลิงก์ Google Sheet ใหม่เข้าไปในรายการที่ใช้อยู่ (ไม่ทับของเดิม รวมถึงลิงก์เริ่มต้นในโค้ดด้วย)
 * items: array ของ { name, url } (name ใส่หรือไม่ใส่ก็ได้)
 * คืนค่าสถานะล่าสุด (เหมือน getAdminStatus) ให้หน้า Admin เอาไปแสดงต่อได้เลย
 */
function appendConfigUrls(password, items) {
  if (!checkAdminPassword(password)) {
    throw new Error('รหัสผ่านไม่ถูกต้อง');
  }

  const inputs = (items || []).map(function (it) {
    return (typeof it === 'string') ? { name: '', url: it } : { name: it.name || '', url: it.url || '' };
  }).filter(function (it) { return !!String(it.url || '').trim(); });

  const results = inputs.map(function (it) {
    return { name: it.name, input: it.url, csvUrl: convertToCsvUrl(it.url) };
  });
  const invalid = results.filter(function (r) { return !r.csvUrl; });
  if (invalid.length) {
    throw new Error('พบลิงก์ที่แปลงไม่ได้ ' + invalid.length + ' รายการ กรุณาตรวจสอบอีกครั้ง');
  }
  if (!results.length) {
    throw new Error('กรุณาวางลิงก์อย่างน้อย 1 ลิงก์');
  }

  const existing = getEffectiveConfigItems_(); // รวมลิงก์เริ่มต้นในโค้ดไว้ด้วย จะได้ไม่หายไปตอนเพิ่มลิงก์ใหม่
  const existingUrls = existing.map(function (it) { return it.csvUrl; });

  results.forEach(function (r) {
    if (existingUrls.indexOf(r.csvUrl) === -1) {
      existing.push({ name: r.name, raw: r.csvUrl, csvUrl: r.csvUrl });
      existingUrls.push(r.csvUrl);
    }
  });

  saveStoredConfigItems_(existing);
  refreshVacancyData();

  return getAdminStatus();
}

/**
 * ลบลิงก์ 1 รายการออกจากลิสต์ตามลำดับ (row) ที่ระบุ ลบได้ทั้งลิงก์ที่เพิ่มเองและลิงก์เริ่มต้นในโค้ด
 * คืนค่าสถานะล่าสุด (เหมือน getAdminStatus) ให้หน้า Admin เอาไปแสดงต่อได้เลย
 */
function deleteConfigUrlRow(password, rowNumber) {
  if (!checkAdminPassword(password)) {
    throw new Error('รหัสผ่านไม่ถูกต้อง');
  }

  const existing = getEffectiveConfigItems_();

  const row = Number(rowNumber);
  if (isNaN(row) || row < 0 || row >= existing.length) {
    throw new Error('ไม่พบลิงก์ลำดับที่ระบุ');
  }

  existing.splice(row, 1);
  saveStoredConfigItems_(existing); // ถ้าลบจนว่างเปล่า จะกลับไปใช้ค่าเริ่มต้นจากโค้ดอัตโนมัติ
  refreshVacancyData();

  return getAdminStatus();
}

/**
 * แก้ไข/เปลี่ยนทับลิงก์ 1 รายการตามลำดับ (row) ที่ระบุ แก้ได้ทั้งลิงก์ที่เพิ่มเองและลิงก์เริ่มต้นในโค้ด
 * newName: ไม่ใส่ (undefined/null) = คงชื่อเดิมไว้, ใส่ string ว่าง '' = ล้างชื่อทิ้ง
 * คืนค่าสถานะล่าสุด (เหมือน getAdminStatus) ให้หน้า Admin เอาไปแสดงต่อได้เลย
 */
function editConfigUrlRow(password, rowNumber, newRawUrl, newName) {
  if (!checkAdminPassword(password)) {
    throw new Error('รหัสผ่านไม่ถูกต้อง');
  }

  const existing = getEffectiveConfigItems_();

  const row = Number(rowNumber);
  if (isNaN(row) || row < 0 || row >= existing.length) {
    throw new Error('ไม่พบลิงก์ลำดับที่ระบุ');
  }

  const converted = convertToCsvUrl(newRawUrl);
  if (!converted) {
    throw new Error('ลิงก์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
  }

  const name = (newName === undefined || newName === null) ? (existing[row].name || '') : String(newName).trim();
  // เก็บเป็นลิงก์ CSV ที่แปลงแล้วทั้ง raw และ csvUrl เพื่อให้แสดงผลและใช้งานสอดคล้องกัน
  existing[row] = { name: name, raw: converted, csvUrl: converted };
  saveStoredConfigItems_(existing);
  refreshVacancyData();

  return getAdminStatus();
}

/**
 * รีเซ็ตกลับไปใช้ลิสต์เริ่มต้นในโค้ด (เผื่อกรอกผิดแล้วอยากย้อนกลับ)
 * คืนค่าสถานะล่าสุด (เหมือน getAdminStatus) ให้หน้า Admin เอาไปแสดงต่อได้เลย
 */
function resetAdminUrls(password) {
  if (!checkAdminPassword(password)) {
    throw new Error('รหัสผ่านไม่ถูกต้อง');
  }
  PropertiesService.getScriptProperties().deleteProperty(PROP_URLS_KEY);
  refreshVacancyData();
  return getAdminStatus();
}
