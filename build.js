/**
 * Build script: คัดลอกไฟล์ source จาก /gas ไปที่ /dist
 * clasp จะ push จาก /dist เท่านั้น (ดู .clasp.json -> rootDir)
 * วิธีนี้ทำให้ /gas เป็น source of truth ที่ขึ้น Git ได้ปกติ
 * ในขณะที่ /dist เป็น build output ที่ .gitignore กันไว้ไม่ให้ push ขึ้น Git
 */
const fs = require('fs-extra');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'gas');
const DIST_DIR = path.join(__dirname, 'dist');

async function build() {
  console.log(' ล้างโฟลเดอร์ dist เดิม...');
  await fs.emptyDir(DIST_DIR);

  console.log(' คัดลอกไฟล์จาก /gas -> /dist ...');
  await fs.copy(SRC_DIR, DIST_DIR);

  console.log(' Build เสร็จแล้ว: ' + DIST_DIR);
}

build().catch(function (err) {
  console.error(' Build ล้มเหลว:', err);
  process.exit(1);
});
