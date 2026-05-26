// ════════════════════════════════════════════════════════════
//  PLANNER TEMPLATE — bound Apps Script
//  วิธีใช้:
//  1. เปิดไฟล์ Sheets ต้นฉบับ (template) ของคุณ
//  2. Extensions → Apps Script
//  3. Paste โค้ดนี้ทั้งหมด → Save
//  4. ไม่ต้อง deploy อะไร — onOpen จะทำงานอัตโนมัติ
//
//  เพิ่ม sheet ชื่อ "_meta" ในไฟล์ template ด้วย (ปล่อยว่างไว้)
//  GAS web app จะเขียน ID + expiry ลงไปหลังจาก copy
// ════════════════════════════════════════════════════════════

function onOpen() {
  const ss        = SpreadsheetApp.getActiveSpreadsheet();
  const currentId = ss.getId();
  const meta      = ss.getSheetByName('_meta');

  // ── ไม่มี _meta sheet = ก็อปมาแล้วลบ sheet นั้นออก ──
  if (!meta) {
    clearAllSheets(ss);
    ss.toast(
      'ไฟล์นี้ไม่ใช่ไฟล์เดโมที่ออกให้ กรุณาขอทดลองใหม่ทางเว็บไซต์',
      '⚠️ ไม่ได้รับอนุญาต', -1
    );
    return;
  }

  const registeredId = meta.getRange('A1').getValue().toString().trim();

  // ── registeredId ว่าง = เปิดไฟล์ template ต้นฉบับ ปกติ ──
  if (!registeredId) return;

  // ── ID ไม่ตรง = ก็อปมาจากสำเนาเดโม ──
  if (registeredId !== currentId) {
    clearAllSheets(ss);
    ss.toast(
      'ไฟล์นี้ไม่ใช่ไฟล์เดโมที่ออกให้ กรุณาขอทดลองใหม่ทางเว็บไซต์',
      '⚠️ ไม่ได้รับอนุญาต', -1
    );
    return;
  }

  // ── เช็คหมดอายุ ──
  const expiresRaw = meta.getRange('A2').getValue();
  if (!expiresRaw) return;

  const now      = new Date();
  const expiresAt = new Date(expiresRaw);

  if (now > expiresAt) {
    clearAllSheets(ss);
    ss.toast(
      'หมดเวลาทดลองแล้ว — ขอบคุณที่ทดลองใช้นะครับ! ซื้อเพื่อใช้งานตลอดได้เลย',
      '⏰ หมดเวลา', -1
    );
    return;
  }

  // ── ยังไม่หมดเวลา แสดง banner ──
  const minutesLeft = Math.ceil((expiresAt - now) / 60000);
  ss.toast(
    `⏱ เหลือเวลาทดลองอีก ~${minutesLeft} นาที — ซื้อเพื่อใช้งานตลอด!`,
    'Planner Demo', 8
  );
}

// ── ลบเนื้อหาทุก sheet ยกเว้น _meta ──
function clearAllSheets(ss) {
  ss.getSheets().forEach(sheet => {
    if (sheet.getName() === '_meta') return;
    try { sheet.clearContents(); } catch(_) {}
  });
}
