// ════════════════════════════════════════════════════════════
//  PLANNER DEMO — Google Apps Script Web App
//
//  วิธี deploy:
//  1. เปิด script.google.com → สร้าง project ใหม่
//  2. Paste โค้ดนี้ทั้งหมด
//  3. ใส่ TEMPLATE_ID ของไฟล์ Sheets ต้นฉบับ
//  4. Deploy → New deployment → Web app
//     - Execute as: Me
//     - Who has access: Anyone
//  5. Copy URL ไปใส่ใน planner-embed.html ที่ GAS_URL
//
//  ไฟล์ template ต้องมี:
//  - sheet ชื่อ "_meta" (ปล่อยว่าง)
//  - Apps Script จาก planner-template-script.gs
// ════════════════════════════════════════════════════════════

const TEMPLATE_ID  = 'ใส่-ID-ไฟล์-SHEETS-ต้นฉบับ-ตรงนี้';
const DEMO_MINUTES = 5;

// ─── Entry Point ─────────────────────────────────────────────
function doGet(e) {
  const action = (e.parameter.action || '').trim();

  try {
    if (action === 'create') return createCopy();
    if (action === 'delete') return deleteCopy(e.parameter.id || '');
  } catch (err) {
    return jsonOut({ ok: false, error: err.message });
  }

  return jsonOut({ ok: false, error: 'unknown action' });
}

// ─── สร้างสำเนาไฟล์ ──────────────────────────────────────────
function createCopy() {
  const file = DriveApp.getFileById(TEMPLATE_ID);
  const copy = file.makeCopy(
    'Planner Demo — ' +
    Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM HH:mm')
  );
  const id = copy.getId();

  // เปิดให้ link แก้ไขได้เลย
  copy.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.EDIT
  );

  // ── เขียน ID + expiry ลง _meta และล็อก sheet ──
  try {
    const ss         = SpreadsheetApp.openById(id);
    const meta       = ss.getSheetByName('_meta');
    const expiresAt  = new Date(Date.now() + DEMO_MINUTES * 60 * 1000);

    if (meta) {
      meta.getRange('A1').setValue(id);                    // File ID ของสำเนานี้
      meta.getRange('A2').setValue(expiresAt.toISOString()); // เวลาหมดอายุ
      meta.hideSheet();                                    // ซ่อน sheet

      // ล็อกไม่ให้ editor แก้ไข
      const prot = meta.protect();
      prot.setDescription('Demo metadata — do not modify');
      prot.removeEditors(prot.getEditors());
    }
  } catch (err) {
    // ถ้าเปิด SS ไม่ได้ ก็ยังส่ง URL ให้ปกติ
  }

  // ── เก็บ ID ใน queue สำหรับ auto-delete ──
  const props = PropertiesService.getScriptProperties();
  const queue = JSON.parse(props.getProperty('q') || '{}');
  queue[id]   = Date.now() + DEMO_MINUTES * 60 * 1000;
  props.setProperty('q', JSON.stringify(queue));

  // สร้าง trigger ลบอัตโนมัติ (DEMO_MINUTES + 1 นาทีเผื่อ delay)
  ScriptApp.newTrigger('runCleanup')
    .timeBased()
    .after((DEMO_MINUTES + 1) * 60 * 1000)
    .create();

  const editUrl = 'https://docs.google.com/spreadsheets/d/' + id + '/edit';
  return jsonOut({ ok: true, id: id, editUrl: editUrl });
}

// ─── ลบสำเนา (frontend เรียกเมื่อปิด/หมดเวลา) ───────────────
function deleteCopy(id) {
  if (!id) return jsonOut({ ok: false, error: 'no id' });

  try {
    DriveApp.getFileById(id).setTrashed(true);
  } catch (_) {}

  // ลบออกจาก queue ด้วย
  const props = PropertiesService.getScriptProperties();
  const queue = JSON.parse(props.getProperty('q') || '{}');
  delete queue[id];
  props.setProperty('q', JSON.stringify(queue));

  return jsonOut({ ok: true });
}

// ─── Auto-cleanup (trigger เรียกอัตโนมัติ) ───────────────────
function runCleanup() {
  const props = PropertiesService.getScriptProperties();
  const queue = JSON.parse(props.getProperty('q') || '{}');
  const now   = Date.now();
  const keep  = {};

  Object.entries(queue).forEach(([id, deleteAt]) => {
    if (now >= deleteAt) {
      try { DriveApp.getFileById(id).setTrashed(true); } catch (_) {}
    } else {
      keep[id] = deleteAt;
    }
  });

  props.setProperty('q', JSON.stringify(keep));

  // ลบ trigger ตัวนี้ออก เพื่อไม่ให้ทับถม
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'runCleanup')
    .forEach(t => ScriptApp.deleteTrigger(t));
}

// ─── Helper ──────────────────────────────────────────────────
function jsonOut(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
