// ========================================================================
// VacancyData.js — ดึง/แคช/รีเฟรชข้อมูลตำแหน่งงานจากลิงก์ CSV (ใช้โดยหน้า Index)
// ========================================================================

/**
 * รวมชื่อ BU ที่เป็นหมวดเดียวกัน เช่น "New BaNANA" -> "BaNANA"
 * ตัดคำนำหน้า New (ไม่สนตัวพิมพ์) แล้ว trim
 */
function normalizeBu(raw) {
  let name = String(raw || '').trim();
  if (!name) return '';
  // ตัดคำว่า New ที่ต้นชื่อ (รองรับ "New BaNANA", "NEW BaNANA", "New  BaNANA")
  name = name.replace(/^new\s+/i, '').trim();
  return name;
}

/**
 * ดึงข้อมูล Vacancy ทั้งหมด (มี cache) แล้วส่งกลับเป็น array of object ให้ฝั่ง client
 */
function getVacancyData() {
  const cache = CacheService.getScriptCache();
  const cached = cacheGetChunked(cache, CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }

  const csvUrls = getCurrentCsvUrls();
  const rows = [];
  csvUrls.forEach(function (url) {
    try {
      const csvText = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();
      const data = Utilities.parseCsv(csvText);
      if (!data || data.length < 2) return;

      const header = data[0];
      const idx = {};
      Object.keys(COL).forEach(function (key) {
        idx[key] = header.indexOf(COL[key]);
      });

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const status = idx.STATUS >= 0 ? (row[idx.STATUS] || '').trim() : '';
        if (status !== 'Vacancy') continue; // เอาเฉพาะสถานะ Vacancy เท่านั้น

        rows.push({
          id: idx.ID >= 0 ? row[idx.ID] : '',
          bu: normalizeBu(idx.BU >= 0 ? row[idx.BU] : ''),
          shop: idx.SHOP >= 0 ? row[idx.SHOP] : '',
          province: idx.PROVINCE >= 0 ? row[idx.PROVINCE] : '',
          region: idx.REGION >= 0 ? row[idx.REGION] : '',
          position: idx.POSITION >= 0 ? row[idx.POSITION] : ''
        });
      }
    } catch (e) {
      // ข้ามชีทที่ดึงไม่ได้ ไม่ทำให้ทั้งระบบพัง
      Logger.log('Error fetching ' + url + ': ' + e);
    }
  });

  // ลบข้อมูลซ้ำ (บาง Shop มีหลายแถวตำแหน่งเดียวกันซ้ำ)
  const seen = {};
  const unique = [];
  rows.forEach(function (r) {
    const key = [r.id, r.shop, r.position].join('|');
    if (!seen[key]) {
      seen[key] = true;
      unique.push(r);
    }
  });

  try {
    cachePutChunked(cache, CACHE_KEY, JSON.stringify(unique), CACHE_SECONDS);
  } catch (e) {
    // ถ้า cache ยังใช้ไม่ได้ด้วยเหตุผลใดก็ตาม ให้ข้ามไปเลย ไม่ทำให้ผลลัพธ์พัง
    Logger.log('Cache put failed: ' + e);
  }
  return unique;
}

/**
 * บังคับล้าง cache (เผื่อผู้ใช้กด "รีเฟรชข้อมูล")
 */
function refreshVacancyData() {
  const cache = CacheService.getScriptCache();
  const countStr = cache.get(CACHE_KEY + '_meta');
  if (countStr) {
    const count = parseInt(countStr, 10);
    const keys = [CACHE_KEY + '_meta'];
    for (let i = 0; i < count; i++) keys.push(CACHE_KEY + '_' + i);
    cache.removeAll(keys);
  }
  return getVacancyData();
}
