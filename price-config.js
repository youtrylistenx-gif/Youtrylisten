

// =================================================================
// =================================================================
//
//   ⬇️  แก้ตรงนี้บรรทัดเดียว  ⬇️
//
//   'flash'    =  โปรแฟลชเซล    ฿399.-
//   '50first'  =  โปร 50 คนแรก  ฿299.-
//
if (typeof ACTIVE_PROMO === 'undefined') var ACTIVE_PROMO = 'flash';
//
//   ⬆️  แก้ตรงนี้บรรทัดเดียว  ⬆️
//
// =================================================================
// =================================================================


// ── ตั้งค่าแต่ละโปร ──────────────────────────────────────────────
const PROMOS = {
  '50first': {
    priceNew:    299,
    priceOld:    1490,
    slotsTotal:  50,
    slotsUsed:   45,
    checkoutUrl: 'checkout.html?mode=50first',
    isFlash:     false,
  },
  'flash': {
    priceNew:    399,
    priceOld:    1490,
    slotsTotal:  null,
    slotsUsed:   null,
    checkoutUrl: 'checkout.html?mode=flash',
    isFlash:     true,
  },
};

const PRICE_CONFIG = PROMOS[ACTIVE_PROMO] || PROMOS['50first'];

// ── คำนวณ % ส่วนลด ───────────────────────────────────────────────
function calcDiscount(n, o) {
  if (!o || o <= n) return '';
  return '-' + (Math.round((o - n) / o * 1000) / 10) + '%';
}

// ── flash timer (ใช้ได้ทุกหน้า) ──────────────────────────────────
function startFlashTimer(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  function tick() {
    const diff = 3600000 - (Date.now() % 3600000);
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = 'แฟลชเซล⚡ 0 : ' + String(m).padStart(2,'0') + ' : ' + String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
}

// ── applyPriceConfig — อัปเดตทุก element ในหน้าที่มีอยู่ ─────────
function applyPriceConfig(cfg) {
  const c    = cfg || PRICE_CONFIG;
  const pNew = '฿' + c.priceNew + '.-';
  const pOld = '฿' + c.priceOld.toLocaleString() + '.-';
  const disc = calcDiscount(c.priceNew, c.priceOld);
  const sT   = c.slotsTotal || 50;
  const sU   = c.slotsUsed  || 45;
  const left = sT - sU;
  const pct  = Math.min(100, Math.round(sU / sT * 100));

  // ── generic data-* (planner.html, planner-embed.html) ────────
  document.querySelectorAll('[data-price-discount]').forEach(el => el.textContent = disc);
  document.querySelectorAll('[data-price-new]').forEach(el => el.textContent = pNew);
  document.querySelectorAll('[data-price-old]').forEach(el => el.textContent = pOld);
  document.querySelectorAll('[data-slots-total]').forEach(el => el.textContent = sT + ' คน');
  document.querySelectorAll('[data-slots-count]').forEach(el => el.textContent = sU + '/' + sT);
  document.querySelectorAll('[data-slots-badge]').forEach(el => el.textContent = '🔥 เหลือเพียงแค่ ' + left + ' สิทธิ์สุดท้าย!');
  document.querySelectorAll('[data-slots-bar]').forEach(el => el.style.width = pct + '%');
  document.querySelectorAll('[data-checkout-url]').forEach(el => el.href = c.checkoutUrl);
  document.querySelectorAll('[data-slots-section]').forEach(el => el.style.display = c.isFlash ? 'none' : '');
  document.querySelectorAll('[data-flash-only]').forEach(el => el.style.display = c.isFlash ? '' : 'none');

  // ── index.html ────────────────────────────────────────────────
  const idxBadge = document.getElementById('planner-badge');
  const idxPrice = document.getElementById('planner-price');
  const idxOld   = document.getElementById('planner-old');
  if (idxBadge) idxBadge.textContent = disc;
  if (idxPrice) idxPrice.textContent = pNew;
  if (idxOld)   idxOld.textContent   = pOld;

  const timer1   = document.getElementById('timer1');
  const idxSlots = document.getElementById('idx-slots-wrap');
  if (timer1)   timer1.style.display   = c.isFlash ? 'block' : 'none';
  if (idxSlots) idxSlots.style.display = c.isFlash ? 'none' : 'block';

  if (!c.isFlash) {
    const fill  = document.getElementById('idx-slots-bar-fill');
    const count = document.getElementById('idx-slots-count');
    const total = document.getElementById('idx-slots-total');
    const badge = document.getElementById('idx-slots-badge');
    if (fill)  fill.style.width  = pct + '%';
    if (count) count.textContent = sU + '/' + sT;
    if (total) total.textContent = sT + ' คน';
    if (badge) badge.textContent = '🔥 เหลืออีกแค่ ' + left + ' สิทธิ์สุดท้าย!';
  }

  // ── checkout.html ─────────────────────────────────────────────
  const oldPriceEl  = document.getElementById('old-price');
  const discAmtEl   = document.getElementById('discount-amount');
  const finalPrEl   = document.getElementById('final-price');
  const flashBadge  = document.getElementById('flash-sale-text');
  if (oldPriceEl) oldPriceEl.textContent = '฿' + c.priceOld.toLocaleString();
  if (discAmtEl)  discAmtEl.textContent  = '- ฿' + (c.priceOld - c.priceNew).toLocaleString();
  if (finalPrEl)  finalPrEl.textContent  = '฿' + c.priceNew;
  if (flashBadge) flashBadge.style.display = c.isFlash ? 'inline-flex' : 'none';

  // ── flash timers ──────────────────────────────────────────────
  if (c.isFlash) {
    startFlashTimer('timer1');          // index.html
    startFlashTimer('flash-sale-text'); // checkout.html + planner.html
  }
}
