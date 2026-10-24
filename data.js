/* Seed data and product artwork. Product images are generated as SVG so the app needs no image files. */
(function () {
  const art = (kind, c1, c2) => {
    const d = {
      heel: '<path d="M44 58 C50 50 64 50 68 60 L76 92 C96 108 142 112 186 124 C200 128 200 140 184 140 L96 134 C70 130 50 120 44 104 Z" fill="§1"/><path d="M44 104 C50 120 70 130 96 134 L184 140" stroke="§2" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M50 118 L66 124 L62 152 L54 152 Z" fill="§2"/><path d="M68 60 C74 80 90 96 120 106" stroke="§2" stroke-width="3" fill="none" opacity=".6"/>',
      flat: '<path d="M30 116 C32 98 52 92 76 98 C96 104 112 108 132 104 C158 98 186 100 198 116 C204 126 198 136 184 136 L48 136 C34 136 28 128 30 116 Z" fill="§1"/><path d="M96 104 C104 92 122 92 132 104" stroke="§2" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="30" y="134" width="170" height="7" rx="3.5" fill="§2"/>',
      sandal: '<rect x="26" y="130" width="176" height="12" rx="6" fill="§2"/><path d="M30 130 C60 122 140 120 198 130 Z" fill="§1"/><path d="M82 126 C84 98 112 94 128 126" stroke="§1" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M150 124 C154 108 172 106 186 124" stroke="§1" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="105" cy="104" r="5" fill="#fff" opacity=".8"/>',
      sneaker: '<path d="M30 112 C30 86 44 70 66 68 L88 68 C96 84 116 92 146 96 C176 100 202 108 204 124 C204 134 196 138 188 138 L40 138 C32 138 30 128 30 112 Z" fill="§1"/><rect x="28" y="130" width="178" height="14" rx="7" fill="§2"/><path d="M96 78 L120 92 M86 86 L110 100 M76 94 L98 106" stroke="§2" stroke-width="4" stroke-linecap="round"/><path d="M30 112 C50 106 70 106 88 112" stroke="§2" stroke-width="3" fill="none"/>',
      boot: '<path d="M62 24 L108 24 L112 88 C140 96 188 100 202 120 C206 128 204 138 194 138 L58 138 C50 138 46 130 48 120 C52 94 60 60 62 24 Z" fill="§1"/><rect x="60" y="24" width="50" height="14" rx="3" fill="§2"/><rect x="46" y="134" width="156" height="12" rx="5" fill="§2"/><path d="M70 40 L100 40 M70 52 L100 52 M72 64 L102 64" stroke="§2" stroke-width="3" opacity=".7"/>',
      tote: '<path d="M68 72 C68 22 152 22 152 72" stroke="§2" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M40 70 L180 70 L194 148 L26 148 Z" fill="§1"/><path d="M40 70 L180 70 L184 90 L36 90 Z" fill="§2" opacity=".35"/><rect x="98" y="84" width="24" height="16" rx="3" fill="§2"/>',
      clutch: '<rect x="30" y="64" width="160" height="84" rx="14" fill="§1"/><path d="M30 78 C80 112 140 112 190 78" stroke="§2" stroke-width="6" fill="none"/><circle cx="110" cy="104" r="10" fill="§2"/><circle cx="110" cy="104" r="4" fill="§1"/>',
      cross: '<path d="M56 74 C84 4 136 4 164 74" stroke="§2" stroke-width="8" fill="none"/><rect x="44" y="68" width="132" height="82" rx="18" fill="§1"/><path d="M44 96 L176 96" stroke="§2" stroke-width="5"/><circle cx="110" cy="116" r="9" fill="§2"/>',
      belt: '<rect x="14" y="98" width="192" height="26" rx="6" fill="§1"/><rect x="88" y="88" width="44" height="46" rx="6" fill="none" stroke="§2" stroke-width="8"/><rect x="106" y="104" width="8" height="14" rx="2" fill="§2"/><circle cx="40" cy="111" r="3" fill="§2"/><circle cx="58" cy="111" r="3" fill="§2"/><circle cx="162" cy="111" r="3" fill="§2"/><circle cx="180" cy="111" r="3" fill="§2"/>',
      scarf: '<path d="M44 38 C90 66 132 20 178 48 L172 132 C132 104 90 152 50 120 Z" fill="§1"/><path d="M62 62 C98 84 132 42 166 68 M60 96 C96 118 132 84 164 104" stroke="§2" stroke-width="5" fill="none"/>',
      wallet: '<rect x="34" y="58" width="152" height="92" rx="14" fill="§1"/><path d="M34 82 L186 82" stroke="§2" stroke-width="5"/><rect x="134" y="98" width="52" height="34" rx="9" fill="§2"/><circle cx="152" cy="115" r="5" fill="§1"/>',
      shades: '<path d="M28 82 C28 74 40 72 56 72 C82 72 98 80 98 98 C98 118 84 126 62 126 C40 126 28 116 28 98 Z" fill="§1"/><path d="M192 82 C192 74 180 72 164 72 C138 72 122 80 122 98 C122 118 136 126 158 126 C180 126 192 116 192 98 Z" fill="§1"/><path d="M98 90 C106 82 114 82 122 90 M28 84 L14 76 M192 84 L206 76" stroke="§2" stroke-width="6" fill="none" stroke-linecap="round"/>'
    }[kind].replace(/§1/g, c1).replace(/§2/g, c2);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 170"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf4ea"/><stop offset="1" stop-color="#eadcc9"/></linearGradient></defs><rect width="220" height="170" fill="url(#g)"/><ellipse cx="110" cy="152" rx="80" ry="8" fill="rgba(60,30,60,.12)"/>${d}</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };
  const P = [
    ['p01', 'Aurora Block Heel', 'Shoes', 'Heels', 8500, null, 'heel', [['Plum', '#5a2a5e', '#c9a24b'], ['Black', '#222', '#c9a24b']]],
    ['p02', 'Soraya Stiletto', 'Shoes', 'Heels', 9800, 7800, 'heel', [['Ruby', '#a3243b', '#222'], ['Nude', '#d7b49e', '#8a5a44']]],
    ['p03', 'Mina Ballet Flat', 'Shoes', 'Flats', 4200, null, 'flat', [['Rose', '#d98ca0', '#7a3b4c'], ['Navy', '#27395f', '#c9a24b']]],
    ['p04', 'Zara Pointed Flat', 'Shoes', 'Flats', 4800, 3900, 'flat', [['Sand', '#cdb18b', '#6f5436'], ['Black', '#222', '#777']]],
    ['p05', 'Palm Strap Sandal', 'Shoes', 'Sandals', 3600, null, 'sandal', [['Tan', '#b8814f', '#5b3a1d'], ['White', '#f2efe8', '#c9a24b']]],
    ['p06', 'Layla Gem Sandal', 'Shoes', 'Sandals', 5200, null, 'sandal', [['Gold', '#c9a24b', '#5a2a5e'], ['Silver', '#b9bcc4', '#3a3f4b']]],
    ['p07', 'Metro Street Sneaker', 'Shoes', 'Sneakers', 6900, 5500, 'sneaker', [['White', '#f4f1ea', '#5a2a5e'], ['Mint', '#8fcfb6', '#2b5a49']]],
    ['p08', 'Ayla Ankle Boot', 'Shoes', 'Boots', 11500, null, 'boot', [['Brown', '#6d4528', '#c9a24b'], ['Black', '#1e1e22', '#8a8a92']]],
    ['p09', 'Noor Leather Tote', 'Handbags', 'Totes', 12000, null, 'tote', [['Cognac', '#9a5b2b', '#4a2a12'], ['Black', '#222', '#c9a24b']]],
    ['p10', 'Hira Evening Clutch', 'Handbags', 'Clutches', 5400, null, 'clutch', [['Gold', '#c9a24b', '#5a2a5e'], ['Emerald', '#1f6b55', '#d9c48a']]],
    ['p11', 'Sana Crossbody', 'Handbags', 'Crossbody', 7600, 6200, 'cross', [['Plum', '#5a2a5e', '#c9a24b'], ['Sand', '#cdb18b', '#6f5436']]],
    ['p12', 'Dua Mini Tote', 'Handbags', 'Totes', 9400, null, 'tote', [['Rose', '#d98ca0', '#7a3b4c'], ['Cream', '#efe6d4', '#a58a5a']]],
    ['p13', 'Kiran Bridal Clutch', 'Handbags', 'Clutches', 6800, null, 'clutch', [['Ivory', '#f3ecdc', '#c9a24b'], ['Blush', '#efc9c4', '#a65b5b']]],
    ['p14', 'Fiza Day Crossbody', 'Handbags', 'Crossbody', 8200, null, 'cross', [['Teal', '#1f6f78', '#e0c98a'], ['Black', '#222', '#999']]],
    ['p15', 'Classic Leather Belt', 'Accessories', 'Belts', 2400, null, 'belt', [['Brown', '#6d4528', '#c9a24b'], ['Black', '#222', '#c9a24b']]],
    ['p16', 'Silk Print Scarf', 'Accessories', 'Scarves', 2900, 2200, 'scarf', [['Plum', '#7b3f86', '#f2d28b'], ['Teal', '#2a8791', '#f4e3b2']]],
    ['p17', 'Zip Wallet', 'Accessories', 'Wallets', 3100, null, 'wallet', [['Black', '#222', '#c9a24b'], ['Rose', '#d98ca0', '#7a3b4c']]],
    ['p18', 'Cat-Eye Sunglasses', 'Accessories', 'Sunglasses', 3800, null, 'shades', [['Black', '#1c1c20', '#c9a24b'], ['Tortoise', '#7b4a24', '#d8b36a']]],
    ['p19', 'Pearl Chain Belt', 'Accessories', 'Belts', 2700, null, 'belt', [['Gold', '#c9a24b', '#f4efe3'], ['Silver', '#b9bcc4', '#f4efe3']]],
    ['p20', 'Everyday Card Holder', 'Accessories', 'Wallets', 1500, null, 'wallet', [['Plum', '#5a2a5e', '#c9a24b'], ['Tan', '#b8814f', '#5b3a1d']]]
  ];
  const SIZES = [36, 37, 38, 39, 40, 41];
  function seed() {
    const now = Date.now(), H = 36e5, products = {}, stock = {};
    P.forEach(([id, name, cat, sub, price, sale, kind, cols], i) => {
      products[id] = { id, name, cat, sub, price, sale, kind, colours: cols.map(c => ({ name: c[0], c1: c[1], c2: c[2] })), sizes: cat === 'Shoes' ? SIZES : ['One size'], rating: +(4 + ((i * 7) % 10) / 10).toFixed(1), blurb: sub + ' from the Metro Shoes ' + (cat === 'Shoes' ? 'footwear' : cat.toLowerCase()) + ' range.' };
      cols.forEach((c, ci) => products[id].sizes.forEach((s, si) => { const h = ((i * 5 + ci * 3 + si * 7) % 11) + 8; stock[id + '-' + ci + '-' + s] = { h, r: (i + si) % 7 === 0 ? 1 : 0 }; }));
    });
    stock['p02-0-38'] = { h: 3, r: 0 }; stock['p09-1-One size'] = { h: 5, r: 0 }; stock['p16-0-One size'] = { h: 3, r: 0 }; stock['p07-1-40'] = { h: 2, r: 0 }; stock['p11-0-One size'] = { h: 4, r: 0 };
    const users = {
      u1: { id: 'u1', role: 'customer', name: 'Ayesha Khan', email: 'ayesha@example.com', mobile: '+92 300 1234567', region: 'PK', pw: 'Demo1234', spend12m: 62000, addr: [{ label: 'Home', line: 'House 12, Street 4, Gulberg III, Lahore' }], wish: ['p01', 'p09', 'p11'], cur: 'PKR' },
      u2: { id: 'u2', role: 'customer', name: 'Sarah Ahmed', email: 'sarah@example.com', mobile: '+44 7700 900123', region: 'UK', pw: 'Demo1234', spend12m: 12000, addr: [{ label: 'Home', line: '14 Church Road, Bradford BD1 4AB' }], wish: ['p06'], cur: 'GBP' },
      u3: { id: 'u3', role: 'handler', name: 'Hamza Ali (Order Handler)', email: 'handler@metroshoes.test', mobile: '+92 301 5550001', pw: 'Staff1234' },
      u4: { id: 'u4', role: 'warehouse', name: 'Bilal Iqbal (Warehouse)', email: 'warehouse@metroshoes.test', mobile: '+92 301 5550002', pw: 'Staff1234' },
      u5: { id: 'u5', role: 'admin', name: 'Maryam Raza (Owner / Admin)', email: 'admin@metroshoes.test', mobile: '+92 301 5550003', pw: 'Staff1234' }
    };
    const mk = (id, uid, dAgo, stage, items, cur, pay) => ({ id, uid, placedAt: now - dAgo * 24 * H, stage, cur, payment: pay, items, log: [{ t: now - dAgo * 24 * H, stage: 'Placed', by: 'system' }], contacts: [] });
    const orders = {
      'MS-1001': mk('MS-1001', 'u1', 9, 'Delivered', [{ pid: 'p01', ci: 0, size: 38, qty: 1 }, { pid: 'p09', ci: 0, size: 'One size', qty: 1 }], 'PKR', 'CARD'),
      'MS-1002': mk('MS-1002', 'u2', 7, 'Delivered', [{ pid: 'p06', ci: 0, size: 39, qty: 1 }], 'GBP', 'CARD'),
      'MS-1003': mk('MS-1003', 'u1', 5, 'Delivered', [{ pid: 'p15', ci: 0, size: 'One size', qty: 2 }], 'PKR', 'COD'),
      'MS-1004': mk('MS-1004', 'u1', 4, 'Dispatched', [{ pid: 'p07', ci: 0, size: 39, qty: 1 }], 'PKR', 'CARD'),
      'MS-1005': mk('MS-1005', 'u2', 3, 'Packed', [{ pid: 'p10', ci: 0, size: 'One size', qty: 1 }, { pid: 'p03', ci: 1, size: 38, qty: 1 }], 'GBP', 'CARD'),
      'MS-1006': mk('MS-1006', 'u1', 2, 'Picking', [{ pid: 'p14', ci: 1, size: 'One size', qty: 1 }], 'PKR', 'BANK'),
      'MS-1007': mk('MS-1007', 'u1', 1, 'Confirmed', [{ pid: 'p05', ci: 0, size: 37, qty: 1 }], 'PKR', 'COD'),
      'MS-1008': mk('MS-1008', 'u2', 0.4, 'Awaiting confirmation', [{ pid: 'p11', ci: 0, size: 'One size', qty: 1 }], 'GBP', 'CARD'),
      'MS-1009': mk('MS-1009', 'u1', 0.2, 'Awaiting confirmation', [{ pid: 'p18', ci: 0, size: 'One size', qty: 1 }, { pid: 'p16', ci: 0, size: 'One size', qty: 1 }], 'PKR', 'COD'),
      'MS-1010': mk('MS-1010', 'u2', 12, 'Cancelled', [{ pid: 'p08', ci: 1, size: 40, qty: 1 }], 'GBP', 'CARD')
    };
    const settings = JSON.parse(JSON.stringify(Logic.DEFAULTS)); settings.fx.updated = now - 3 * H; settings.fx.source = 'ExchangeRate API (simulated feed)';
    settings.delivery.PK[2][0] = 1e12; settings.delivery.UK[2][0] = 1e12;
    settings.promos = { WELCOME10: { type: 'pct', value: 10, minPKR: 3000, maxUses: 1000, perUser: 1 }, FLAT500: { type: 'fixed', value: 500, minPKR: 5000 }, EXPIRED5: { type: 'pct', value: 5, minPKR: 0, to: now - 30 * 24 * H } };
    const flow = Logic.STAGES.slice(0, 9);
    Object.values(orders).forEach(o => {
      const u = users[o.uid], L = o.items.map(i => { const p = products[i.pid]; return { id: i.pid, name: p.name, cat: p.cat, price: p.price, sale: p.sale, qty: i.qty }; });
      const r = Logic.price(L, { currency: o.cur, spend12m: u.spend12m, payment: o.payment === 'CARD' ? null : o.payment, settings, now });
      o.totals = { goods: r.goods, discounts: r.discounts, delivery: r.delivery, cod: r.cod, total: r.total, tax: r.tax }; o.fx = settings.fx.pkrPerGbp; o.addr = u.addr[0].line; o.card4 = o.payment === 'CARD' ? '4242' : null;
      const idx = flow.indexOf(o.stage), upto = idx < 0 ? 2 : idx + 1; o.log = flow.slice(0, upto).map((st, k) => ({ t: o.placedAt + k * 2.5 * H, stage: st, by: k < 2 ? 'system' : 'staff' }));
      if (idx < 0) o.log.push({ t: o.placedAt + 26 * H, stage: o.stage, by: 'system' });
      if (o.stage === 'Awaiting confirmation') o.items.forEach(i => { stock[i.pid + '-' + i.ci + '-' + i.size].r += i.qty; });
    });
    return { settings, products, stock, users, orders, fire: seedFire(now), logs: {}, msgs: {}, seq: 1010 };
  }
  function seedFire(now) {
    const D = 864e5; return {
      f1: { id: 'f1', zone: 'Stockroom A (shoes)', item: 'Extinguishers (CO2 and foam)', status: 'Pass', by: 'Bilal Iqbal', t: now - 2 * D, note: 'Pressure gauges in the green' },
      f2: { id: 'f2', zone: 'Stockroom B (handbags)', item: 'Smoke detectors', status: 'Pass', by: 'Bilal Iqbal', t: now - 2 * D, note: 'Tested all six units' },
      f3: { id: 'f3', zone: 'Packing bay', item: 'Cardboard storage clearance (1 m below sprinklers)', status: 'Action', by: 'Hamza Ali', t: now - 1 * D, note: 'Boxes stacked above limit, moved to Rack 4' },
      f4: { id: 'f4', zone: 'Stockroom A (shoes)', item: 'Emergency exit route', status: 'Pass', by: 'Maryam Raza', t: now - 1 * D, note: 'Clear and lit' }
    };
  }
  window.MetroData = { art, seed, SIZES };
})();
