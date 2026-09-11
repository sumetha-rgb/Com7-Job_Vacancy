// ========================================================================
// CacheUtils.js — helper สำหรับเก็บ/อ่าน string ยาวๆ ใน CacheService
// (CacheService จำกัดขนาดค่าต่อ key ~100KB จึงต้องตัดเป็นหลาย key)
// ========================================================================

/**
 * เก็บ string ยาวๆ ลง cache โดยตัดเป็นหลาย key ถ้าเกินขนาดที่อนุญาต
 */
function cachePutChunked(cache, key, str, ttl) {
  const chunks = [];
  for (let i = 0; i < str.length; i += CACHE_CHUNK_SIZE) {
    chunks.push(str.substring(i, i + CACHE_CHUNK_SIZE));
  }
  const payload = {};
  payload[key + '_meta'] = String(chunks.length);
  chunks.forEach(function (chunk, i) {
    payload[key + '_' + i] = chunk;
  });
  cache.putAll(payload, ttl);
}

/**
 * อ่านค่าที่ถูกตัดเป็น chunk กลับมาเป็น string เดียว คืน null ถ้าไม่พบหรือไม่ครบ
 */
function cacheGetChunked(cache, key) {
  const countStr = cache.get(key + '_meta');
  if (!countStr) return null;
  const count = parseInt(countStr, 10);
  const keys = [];
  for (let i = 0; i < count; i++) keys.push(key + '_' + i);
  const values = cache.getAll(keys);
  let result = '';
  for (let i = 0; i < count; i++) {
    const chunk = values[key + '_' + i];
    if (chunk === undefined || chunk === null) return null; // chunk หายไปบางส่วน ถือว่า cache ใช้ไม่ได้
    result += chunk;
  }
  return result;
}
