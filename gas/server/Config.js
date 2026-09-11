// ========================================================================
// Config.js — ค่าคงที่ทั้งหมดของระบบ รวมไว้ที่เดียวเพื่อให้แก้ไขง่าย
// ========================================================================

// ---------- หน้าค้นหาตำแหน่งงาน (Index) ----------

// ลิงก์ CSV เริ่มต้น (ใช้ถ้ายังไม่มีการตั้งค่าใน Admin)
const DEFAULT_CSV_URLS = [
  'https://docs.google.com/spreadsheets/d/1RWlBnI-aTJ1NIzX4W8fNCimiUvXrr81MYVciaZBElT8/export?format=csv&gid=1760036451',
  'https://docs.google.com/spreadsheets/d/1RWlBnI-aTJ1NIzX4W8fNCimiUvXrr81MYVciaZBElT8/export?format=csv&gid=292496100',
  'https://docs.google.com/spreadsheets/d/1RWlBnI-aTJ1NIzX4W8fNCimiUvXrr81MYVciaZBElT8/export?format=csv&gid=1285814699'
];

// ชื่อกำกับลิงก์แต่ละอัน (เรียงตามลำดับให้ตรงกับ DEFAULT_CSV_URLS ด้านบน)
const DEFAULT_CSV_NAMES = ['BANANA', 'Studio7', 'TRUE+Dtac'];

// ลิงก์ฟอร์มสมัครงาน (ปุ่ม "สนใจสมัครงาน")
const APPLY_FORM_URL = 'https://forms.gle/Y3RERjgbvKhzZnba6';

// ลิงก์ LINE สำหรับติดต่อสอบถามเพิ่มเติม (ปุ่มล่างสุดของหน้าค้นหาตำแหน่งงาน)
const LINE_CONTACT_URL = 'https://page.line.me/comsevencareer';

// ชื่อ header ตามไฟล์ต้นทาง (ใช้เพื่อหา index ของคอลัมน์แบบไม่ fix ตำแหน่ง)
const COL = {
  BU: 'BU ',
  SHOP: 'Shop',
  PROVINCE: 'จังหวัด',
  REGION: 'ภูมิภาค',
  POSITION: 'ตำแหน่งงาน (สรรหา)',
  STATUS: 'สถานะ',
  ID: 'ID '
};

// ---------- Cache ของข้อมูล Vacancy ----------
const CACHE_KEY = 'VACANCY_DATA_V2';
const CACHE_SECONDS = 3600; // cache 1 ชั่วโมง เพื่อลดการยิงโหลดชีทซ้ำๆ
const CACHE_CHUNK_SIZE = 90000; // CacheService จำกัดค่าไม่เกิน ~100KB ต่อ key จึงตัดเป็นชิ้นละ 90KB

// ---------- Admin: ล็อกอิน / ตั้งค่าลิงก์ฐานข้อมูล ----------
const PROP_URLS_KEY = 'CSV_URLS_JSON';
const PROP_PASSWORD_KEY = 'ADMIN_PASSWORD';
const DEFAULT_ADMIN_PASSWORD = 'com7admin'; // ผู้ดูแลควรเปลี่ยนรหัสนี้ทันทีจากหน้า Admin

// ---------- Admin: ส่งอีเมลยืนยันสัมภาษณ์ ----------

// ชีทฐานข้อมูลผู้สมัคร (อ่านเฉพาะ ชื่อ-สกุล / E-mail / สถานะ)
// ค่าเริ่มต้น (ใช้ถ้าแอดมินยังไม่เคยวางลิงก์ชีทของตัวเองจากหน้า Admin)
const DEFAULT_EMAIL_SHEET_ID = '1c_V5Cnu6AltP8r4TFbQBsq2lk72LhyyTMTgPmVdXOPE';
const DEFAULT_EMAIL_SHEET_GID = 0; // แท็บ (gid) ของชีทที่เก็บรายชื่อผู้สมัคร (ต้นทาง)

// key ที่ใช้เก็บลิงก์ชีทผู้สมัคร (ที่แอดมินวางเอง) ใน Script Properties
const PROP_EMAIL_SHEET_KEY = 'EMAIL_SHEET_CONFIG_JSON';

// ชื่อ header ต้องตรงกับในชีทเป๊ะๆ (ไม่สนจำนวนช่องว่างซ้ำ เพราะจะ normalize ให้ตอนเทียบ)
const EMAIL_COL = {
  NAME: 'ชื่อ-สกุล',
  EMAIL: 'E-mail',
  STATUS: 'เช็คสถานะส่งเมล์ ยืนยันสัมภาษณ์' // แก้ให้ตรงกับหัวตารางจริงในชีทต้นทาง
};

const EMAIL_SENT_VALUE = 'ส่งเมล์แล้ว';
const EMAIL_NOT_SENT_VALUE = 'ยังไม่ส่ง';

// ---------- ชีทบันทึกผล (log) คนที่ส่งอีเมลสำเร็จแล้ว: ชื่อ-สกุล / E-mail / สถานะ ----------
// อยู่สเปรดชีทเดียวกับ EMAIL_SHEET_ID แต่คนละแท็บ (gid) เพื่อไม่ไปยุ่งกับชีทต้นทาง
const EMAIL_LOG_SHEET_GID = 540205531;
const EMAIL_LOG_HEADERS = ['ชื่อ-สกุล', 'E-mail', 'สถานะ'];

// โฟลเดอร์ Google Drive เริ่มต้นสำหรับเก็บรูปที่แอดมินอัปโหลดไว้แนบอีเมล
const PROP_EMAIL_FOLDER_KEY = 'EMAIL_IMAGE_FOLDER_ID';
const DEFAULT_EMAIL_FOLDER_ID = '1FwIxLkcmKJc1H0s5iylosD36hd-ThkTy';

// ---------- ตั้งค่าผู้ให้บริการส่งอีเมล (Brevo) ----------
// ⚠️ ห้ามใส่ API Key ตรงนี้ในโค้ดอีกต่อไป (เพราะโค้ดอาจถูกแชร์/อัปโหลดขึ้น git ได้)
// ให้ไปตั้งค่าจริงที่หน้า Admin > แท็บ "ส่งอีเมล" > "ตั้งค่าผู้ส่งอีเมล (Brevo)" แทน
// ค่าที่กรอกจากหน้า Admin จะถูกเก็บแบบเข้ารหัสไว้ใน Script Properties ของโปรเจกต์เท่านั้น (ไม่โผล่ในโค้ด ไม่โผล่ให้แอดมินเห็นซ้ำ)
// ถ้าเว้นว่างไว้ ระบบจะส่งผ่าน Gmail แทนโดยอัตโนมัติ (มีโควตาจำกัดรายวัน)
const PROP_BREVO_API_KEY = 'BREVO_API_KEY';
const PROP_BREVO_FROM_EMAIL = 'BREVO_FROM_EMAIL';
const PROP_BREVO_FROM_NAME = 'BREVO_FROM_NAME';
const DEFAULT_BREVO_FROM_NAME = 'COM7 Recruitment';

// ลิงก์รูปโลโก้ (.png) ที่จะแสดงกลางหัวอีเมล — ต้องเป็นลิงก์ public เข้าถึงได้จากภายนอก
// เช่นลิงก์แบบ https://lh3.googleusercontent.com/d/FILE_ID (ดูฟังก์ชัน toDirectImageUrl_ ใน EmailTemplate.js)
// ถ้าเว้นว่าง ระบบจะแสดงชื่อบริษัท (BREVO_FROM_NAME) แทนโลโก้
const EMAIL_LOGO_URL = 'https://lh3.googleusercontent.com/d/1etz7KVqvzKzsgIfBC04JAmc5wED0mugR';

// ---------- ข้อความอีเมลที่ระบบเตรียมไว้ (แก้ไขได้ที่นี่) ----------
// ใช้ {ชื่อ} เป็น placeholder จะถูกแทนที่ด้วยชื่อผู้รับแต่ละคนอัตโนมัติ
const EMAIL_SUBJECT = 'COM7 เปิดรับสมัครงาน | ตำแหน่งงานว่างประจำเดือนนี้';
const EMAIL_BODY_TEMPLATE =
  'เรียนคุณ {ชื่อ}\n\n' +
  'บริษัท คอมเซเว่น จำกัด (มหาชน) ขอเชิญชวนผู้ที่สนใจร่วมงานกับเรา\n\n' +
  'ขณะนี้ทางบริษัทมีตำแหน่งงานว่างเปิดรับสมัคร หากคุณสนใจสามารถตรวจสอบตำแหน่งงานว่างทั้งหมดได้ที่ปุ่มด้านล่างนี้\n\n' +
  'ขอแสดงความนับถือ\n' +
  'ฝ่ายทรัพยากรบุคคล COM7';