/* Metro Shoes – business rules (pure functions, no DOM). Works in the browser and in Node. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.Logic = factory(); })(this, function () {
  'use strict';
  const r2 = x => Math.round((x + Number.EPSILON) * 100) / 100;           // half-up rounding at each step
  const DEFAULTS = {
    fx: { pkrPerGbp: 375, margin: 2, updated: Date.now(), outage: false },
    tiers: [{ name: 'Bronze', min: 0, pct: 0 }, { name: 'Silver', min: 50000, pct: 5 }, { name: 'Gold', min: 150000, pct: 8 }],
    bundlePct: 10, capPct: 30, codFee: 100, codMax: 50000,
    tax: { PK: 18, UK: 20 },
    delivery: { PK: [[5000, 250], [10000, 150], [Infinity, 0]], UK: [[30, 4.99], [75, 2.99], [Infinity, 0]] },
    limits: { PK: { min: 1000, max: 150000 }, UK: { min: 5, max: 500 }, maxQty: 5 },
    lowStock: 5, confirmHours: 24, bankHours: 48, rateFreshHours: 24, rateFallbackHours: 72
  };
  const money = (v, cur) => (cur === 'GBP' ? '£' : 'Rs ') + Number(v).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const toGBP = (pkr, rate, margin) => r2(r2(pkr / rate) * (1 + margin / 100));
  const unit = (eff, cur, s) => cur === 'GBP' ? toGBP(eff, s.fx.pkrPerGbp, s.fx.margin) : eff;
  const tier = (spend, s) => [...s.tiers].reverse().find(t => spend >= t.min) || s.tiers[0];
  function rateAgeHours(s, now) { return ((now || Date.now()) - s.fx.updated) / 36e5; }
  function rateStatus(s, now) {
    const h = rateAgeHours(s, now);
    if (s.fx.outage) return { ok: h <= s.rateFallbackHours, state: h <= s.rateFallbackHours ? 'fallback' : 'blocked', hours: h };
    return { ok: h <= s.rateFallbackHours, state: h <= s.rateFreshHours ? 'live' : h <= s.rateFallbackHours ? 'fallback' : 'blocked', hours: h };
  }
  function checkPromo(code, c) {
    const p = (c.settings.promos || {})[String(code).toUpperCase()];
    if (!p) return { ok: false, reason: 'Promo code not recognised' };
    if (p.from && c.now < p.from) return { ok: false, reason: 'Promo code is not valid yet' };
    if (p.to && c.now > p.to) return { ok: false, reason: 'Promo code has expired' };
    if (p.maxUses && c.usedTotal >= p.maxUses) return { ok: false, reason: 'Promo code has been used up' };
    if (p.perUser && c.usedByUser >= p.perUser) return { ok: false, reason: 'You have already used this promo code' };
    const min = c.currency === 'GBP' ? toGBP(p.minPKR, c.settings.fx.pkrPerGbp, c.settings.fx.margin) : p.minPKR;
    if (c.goods < min) return { ok: false, reason: 'Spend at least ' + money(min, c.currency) + ' to use this code' };
    if (!c.hasFull) return { ok: false, reason: 'Promo codes do not apply to sale items' };
    return { ok: true, type: p.type, value: p.value };
  }
  function price(lines, o) {
    const s = o.settings || DEFAULTS, cur = o.currency, reg = cur === 'GBP' ? 'UK' : 'PK';
    const L = lines.map(l => { const onSale = l.sale != null && l.sale < l.price, eff = onSale ? l.sale : l.price, u = unit(eff, cur, s); return { ...l, onSale, unit: u, total: r2(u * l.qty) }; });
    const goods = r2(L.reduce((a, l) => a + l.total, 0)), full = L.filter(l => !l.onSale), fullTotal = r2(full.reduce((a, l) => a + l.total, 0));
    let bundle = 0; const bags = full.filter(l => l.cat === 'Handbags');
    if (full.some(l => l.cat === 'Shoes') && bags.length) { const b = bags.reduce((m, l) => l.unit < m.unit ? l : m); bundle = r2(b.unit * s.bundlePct / 100); }
    const t = tier(o.spend12m || 0, s); let loyalty = r2((fullTotal - bundle) * t.pct / 100), promo = 0, promoMsg = null;
    if (o.promo) {
      const pr = checkPromo(o.promo, { goods: r2(goods - bundle - loyalty), currency: cur, settings: s, usedTotal: o.promoUsedTotal || 0, usedByUser: o.promoUsedByUser || 0, now: o.now || Date.now(), hasFull: full.length > 0 });
      if (pr.ok) { const base = r2(fullTotal - bundle - loyalty); promo = pr.type === 'pct' ? r2(base * pr.value / 100) : Math.min(base, cur === 'GBP' ? toGBP(pr.value, s.fx.pkrPerGbp, s.fx.margin) : pr.value); } else promoMsg = pr.reason;
    }
    const cap = r2(fullTotal * s.capPct / 100); let capped = false;
    if (r2(bundle + loyalty + promo) > cap) { capped = true; let ex = r2(bundle + loyalty + promo - cap); const cut = v => { const c = Math.min(v, ex); ex = r2(ex - c); return r2(v - c); }; promo = cut(promo); loyalty = cut(loyalty); bundle = cut(bundle); }
    const disc = r2(bundle + loyalty + promo), after = r2(goods - disc), lim = s.limits[reg]; let limitMsg = null;
    if (L.length) { if (after < lim.min) limitMsg = 'Minimum order is ' + money(lim.min, cur); else if (after > lim.max) limitMsg = 'Maximum order is ' + money(lim.max, cur); }
    const over = L.find(l => l.qty > s.limits.maxQty); if (over) limitMsg = 'Maximum ' + s.limits.maxQty + ' of one variant per order (' + over.name + ')';
    const tb = s.delivery[reg], delivery = L.length ? (tb.find(([ub]) => after < ub) || tb[tb.length - 1])[1] : 0;
    const cod = o.payment === 'COD' && reg === 'PK' ? s.codFee : 0; let payMsg = null;
    if (o.payment === 'COD' && reg !== 'PK') payMsg = 'Cash on delivery is available in Pakistan only';
    if (o.payment === 'BANK' && reg !== 'PK') payMsg = 'Bank transfer is available in Pakistan only';
    if (o.payment === 'COD' && reg === 'PK' && after > s.codMax) payMsg = 'Cash on delivery is limited to ' + money(s.codMax, 'PKR');
    const total = r2(after + delivery + cod), rate = s.tax[reg], tax = r2(total * rate / (100 + rate));
    return { currency: cur, lines: L, goods, fullTotal, bundle, loyalty, loyaltyTier: t.name, promo, promoMsg, capped, cap, discounts: disc, goodsAfter: after, delivery, cod, total, tax, taxRate: rate, limitMsg, payMsg, valid: !limitMsg && !payMsg && L.length > 0 };
  }
  const STAGES = ['Placed', 'Awaiting confirmation', 'Confirmed', 'Picking', 'Packed', 'Ready for dispatch', 'Dispatched', 'Out for delivery', 'Delivered', 'Cancelled', 'Returned'];
  const FLOW = { 'Placed': ['Awaiting confirmation', 'Cancelled'], 'Awaiting confirmation': ['Confirmed', 'Cancelled'], 'Confirmed': ['Picking', 'Cancelled'], 'Picking': ['Packed'], 'Packed': ['Ready for dispatch'], 'Ready for dispatch': ['Dispatched'], 'Dispatched': ['Out for delivery'], 'Out for delivery': ['Delivered', 'Cancelled'], 'Delivered': ['Returned'], 'Cancelled': [], 'Returned': [] };
  const ROLE_STAGES = { handler: ['Awaiting confirmation', 'Confirmed', 'Cancelled'], warehouse: ['Picking', 'Packed', 'Ready for dispatch', 'Dispatched', 'Out for delivery', 'Delivered'], admin: STAGES };
  function canMove(role, from, to) { return (FLOW[from] || []).includes(to) && (ROLE_STAGES[role] || []).includes(to); }
  function deadline(order) { return order.placedAt + (order.payment === 'BANK' ? DEFAULTS.bankHours : DEFAULTS.confirmHours) * 36e5; }
  function validate(f) {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email || '')) e.email = 'Enter a valid email address';
    if (!/^(\+92 ?3\d{2} ?\d{7}|\+44 ?7\d{3} ?\d{6})$/.test((f.mobile || '').trim())) e.mobile = 'Use +92 3xx xxxxxxx or +44 7xxx xxxxxx';
    if (f.password != null && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(f.password)) e.password = 'At least 8 characters with a letter and a number';
    if (f.postcode && f.region === 'UK' && !/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(f.postcode)) e.postcode = 'Enter a valid UK postcode';
    return e;
  }
  return { r2, DEFAULTS, money, toGBP, unit, tier, price, checkPromo, rateStatus, rateAgeHours, STAGES, FLOW, ROLE_STAGES, canMove, deadline, validate };
});
