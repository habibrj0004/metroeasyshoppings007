/* Metro Shoes – application core and storefront. Dashboards are in dash.js. */
(function () {
  const $ = s => document.querySelector(s), esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CFG = window.METRO_CONFIG, M = (v, c) => Logic.money(v, c || App.ui.cur);
  const LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a3585"/><stop offset="1" stop-color="#34113b"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#lg)"/><path d="M13 44V19l19 19 19-19v25" fill="none" stroke="#e8c26a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M51 44l-5 10" stroke="#e8c26a" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="48" r="2.4" fill="#e8c26a"/></svg>';
  const App = window.App = { ui: { cur: localStorage.mcur || 'PKR', cart: JSON.parse(localStorage.mcart || '[]'), user: null, f: { cat: 'All', sub: 'All', q: '', sort: 'feat' }, sel: {}, pay: 'CARD', promo: '' }, A: {}, esc, M, LOGO, $ };
  const S = () => DB.get(), ui = App.ui;
  App.toast = t => { const e = $('#toast'); e.textContent = t; e.style.display = 'block'; clearTimeout(App.tt); App.tt = setTimeout(() => e.style.display = 'none', 2400); };
  App.go = p => { location.hash = p; };
  const saveCart = () => localStorage.mcart = JSON.stringify(ui.cart);
  const P = id => S().products[id], vkey = (pid, ci, size) => pid + '-' + ci + '-' + size;
  /* icons (Lucide, see icons.js), product photos (data.js) and empty-state placeholders */
  const IC = window.Icon, WAIC = IC('whatsapp');
  App.pic = (p, ci) => { const k = p.colours[ci || 0], art = MetroData.art(p.kind, k.c1, k.c2), u = (MetroData.photos || {})[p.id]; if (!u) return art; MetroData.fb[u] = art; return u; };
  App.img = (p, ci, alt, style) => `<img class="pimg" src="${App.pic(p, ci)}" alt="${esc(alt || '')}"${style ? ' style="' + style + '"' : ''} loading="lazy" decoding="async">`;
  App.empty = (icon, title, text, action) => `<div class="empty">${IC(icon)}<b>${title}</b>${text ? `<span>${text}</span>` : ''}${action || ''}</div>`;
  document.addEventListener('error', e => { const t = e.target; if (t && t.tagName === 'IMG') { const f = MetroData.fb[t.getAttribute('src')]; if (f) t.src = f; } }, true);
  const stockOf = p => p.colours.reduce((a, c, ci) => a + p.sizes.reduce((b, s) => b + Math.max(0, DB.avail(vkey(p.id, ci, s))), 0), 0);
  const stockBadge = n => n <= 0 ? '<span class="badge out">Sold out</span>' : n <= 5 ? `<span class="badge low">Only ${n} left</span>` : '<span class="badge ok">In stock</span>';
  const price = p => p.sale != null && p.sale < p.price ? `<s>${M(Logic.unit(p.price, ui.cur, S().settings))}</s>${M(Logic.unit(p.sale, ui.cur, S().settings))}` : M(Logic.unit(p.price, ui.cur, S().settings));
  const wa = (text, to) => `https://wa.me/${(to || CFG.shopWhatsApp).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  const mail = (to, sub, body) => `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
  Object.assign(App, { wa, mail, vkey, P, stockOf, stockBadge });
  const lines = () => ui.cart.map(i => { const p = P(i.pid); return p ? { id: vkey(i.pid, i.ci, i.size), pid: i.pid, name: `${p.name} (${p.colours[i.ci].name}, ${i.size})`, cat: p.cat, price: p.price, sale: p.sale, qty: i.qty, ci: i.ci, size: i.size } : null; }).filter(Boolean);
  App.priceNow = (extra) => {
    const u = ui.user, used = u ? Object.values(S().orders).filter(o => o.uid === u.id && o.promo === (ui.promo || '').toUpperCase() && o.stage !== 'Cancelled').length : 0;
    return Logic.price(lines(), { currency: ui.cur, spend12m: u ? u.spend12m : 0, promo: ui.promo, payment: ui.pay, settings: S().settings, promoUsedByUser: used, now: Date.now(), ...extra });
  };
  App.lines = lines;
  function addToCart(pid, ci, size, qty) {
    const k = vkey(pid, ci, size), ex = ui.cart.find(i => vkey(i.pid, i.ci, i.size) === k), have = ex ? ex.qty : 0;
    if (DB.avail(k) < have + qty) { App.toast(DB.avail(k) <= 0 ? 'Sorry, that size just sold out' : 'Only ' + DB.avail(k) + ' left in that size'); return false; }
    if (have + qty > S().settings.limits.maxQty) { App.toast('Maximum ' + S().settings.limits.maxQty + ' of one variant per order'); return false; }
    ex ? ex.qty += qty : ui.cart.push({ pid, ci, size, qty }); saveCart(); App.toast('Added to cart'); return true;
  }
  /* ---------- layout ---------- */
  const NAV = [['/', IC('house'), 'Home'], ['/shop', IC('shopping-bag'), 'Shop'], ['/track', IC('package'), 'Track'], ['/contact', IC('message-circle'), 'Contact']];
  function menuStore() {
    return `<div class="menu" id="menu"><button data-a="theme">${IC('sun-moon')} Switch light / dark theme</button><button data-a="rate">${IC('arrow-left-right')} Refresh exchange rate</button><a href="${wa('Hello Metro Shoes, I need help with my order.')}" target="_blank" rel="noopener">${WAIC} Chat on WhatsApp</a><a href="${mail(CFG.shopEmail, 'Enquiry from the website', 'Hello Metro Shoes,')}">${IC('mail')} Email the shop</a><button data-a="demo">${IC('key-round')} Demo accounts</button><button data-a="install">${IC('smartphone')} Install this app</button><hr><button data-a="about">${IC('info')} About Metro Shoes</button></div>`;
  }
  function shell(inner) {
    const u = ui.user, n = ui.cart.reduce((a, i) => a + i.qty, 0), r = location.hash.replace('#', '') || '/';
    const acct = u ? [u.role === 'customer' ? '/dash' : '/staff', IC('user'), u.role === 'customer' ? 'Account' : 'Dashboard'] : ['/login', IC('user'), 'Sign in'];
    return `<header class="hdr"><div class="in"><a class="brand" href="#/" aria-label="Metro Shoes home">${LOGO}<span><b>METRO SHOES</b><small>STEP INTO STYLE</small></span></a>
      <div class="search"><input id="q" type="search" placeholder="Search shoes, bags, accessories…" aria-label="Search products" autocomplete="off"><div id="sug" class="sug" hidden></div></div>
      <div class="tools"><div class="cur" role="group" aria-label="Currency"><button data-a="cur" data-v="PKR" class="${ui.cur === 'PKR' ? 'on' : ''}">PKR</button><button data-a="cur" data-v="GBP" class="${ui.cur === 'GBP' ? 'on' : ''}">GBP</button></div>
      <button class="ib" data-a="cartdrawer" aria-label="Open cart">${IC('shopping-cart')}${n ? `<span class="n">${n}</span>` : ''}</button>
      <div style="position:relative"><button class="ib" data-a="menu" aria-label="More options" aria-haspopup="true">${IC('ellipsis-vertical')}</button>${menuStore()}</div></div></div></header>
      <div class="taskbar"><nav aria-label="Main taskbar">${[...NAV, acct].map(([p, i, t]) => `<a href="#${p}" class="${r === p || (p !== '/' && r.startsWith(p)) ? 'on' : ''}"><span class="i">${i}</span>${t}</a>`).join('')}</nav></div>
      <main class="wrap" id="main">${inner}</main>
      <footer class="foot"><div class="in"><div><div class="row">${LOGO.replace('<svg', '<svg width="40" height="40"')}<b class="serif" style="font-size:1.2rem">METRO SHOES</b></div><p>Footwear, handbags and accessories from high street stores in Pakistan, now delivering to the United Kingdom.</p></div>
      <div><b>Help</b><p><a href="#/track">Track an order</a><br><a href="#/contact">Contact us</a><br><a href="${wa('Hello Metro Shoes')}" target="_blank" rel="noopener" class="ic-line">${WAIC} WhatsApp ${'+' + CFG.shopWhatsApp}</a></p></div>
      <div><b>Company</b><p><a href="#/about">About us</a><br><a href="#/delivery">Delivery and payment</a><br><a href="#/returns">Returns</a><br><a href="#/privacy">Privacy</a></p></div>
      <div><b>Status</b><p>Data: ${esc(DB.status)}<br>Rate: ${rateLine()}</p></div></div></footer>
      <a class="wa-fab" href="${wa('Hello Metro Shoes, I would like some help.')}" target="_blank" rel="noopener" aria-label="Chat with Metro Shoes on WhatsApp">${WAIC}<span>Chat with us</span></a>`;
  }
  function rateLine() { const s = S().settings, st = Logic.rateStatus(s); return `1 GBP = Rs ${s.fx.pkrPerGbp.toFixed(2)} (${st.state}, ${st.hours.toFixed(0)}h old)`; }
  const productCard = p => { const c = p.colours[0], n = stockOf(p), wl = ui.user && (ui.user.wish || []).includes(p.id);
    return `<article class="pcard"><a href="#/product/${p.id}"><img class="pimg" src="${App.pic(p, 0)}" alt="${esc(p.name)} in ${esc(c.name)}" loading="lazy" decoding="async"></a><div class="b"><div class="row sp"><span class="badge">${esc(p.sub)}</span>${p.sale != null ? '<span class="badge sale">Sale</span>' : ''}</div><a class="t" href="#/product/${p.id}">${esc(p.name)}</a><div class="pr">${price(p)}</div><div class="row sp">${stockBadge(n)}<span class="mute small ic-line">${IC('star', 'star filled')} ${p.rating}</span></div>
      <div class="row" style="margin-top:auto"><button class="btn sm" data-a="quick" data-id="${p.id}" ${n <= 0 ? 'disabled' : ''}>${IC('shopping-cart')} Quick add</button><button class="btn sm alt icon" data-a="wish" data-id="${p.id}" aria-label="Wish list">${IC('heart', wl ? 'filled' : '')}</button></div></div></article>`; };
  /* ---------- pages ---------- */
  function home() {
    const ps = Object.values(S().products), feat = ps.filter(p => p.sale != null).concat(ps.filter(p => p.sale == null)).slice(0, 8), a = ps[0].colours[0];
    return `<section class="hero"><span class="badge" style="background:#e8c26a;color:#2a1a2e">New season</span><h1>Step into style, wherever you shop.</h1><p>Shoes, handbags and accessories with live stock, order tracking and prices in rupees or pounds.</p><div class="row"><a class="btn gold" href="#/shop">Shop now</a><a class="btn alt" href="#/track">Track my order</a><a class="btn wa" target="_blank" rel="noopener" href="${wa('Hello Metro Shoes, I would like some help.')}">${WAIC} Chat on WhatsApp</a></div><div class="art">${App.img(ps[0], 0, '')}</div></section>
    <div class="grid g3">${['Shoes', 'Handbags', 'Accessories'].map(c => { const p = ps.find(x => x.cat === c); return `<a class="card" href="#/shop/${c}" style="text-decoration:none;color:inherit">${App.img(p, 0, '', 'border-radius:10px')}<h3>${c}</h3><span class="mute small">${ps.filter(x => x.cat === c).length} styles</span></a>`; }).join('')}</div>
    <h2 style="margin-top:1.4rem">Featured and on sale</h2><div class="grid">${feat.map(productCard).join('')}</div>
    <div class="grid g3" style="margin-top:1.4rem">${[[IC('radio-tower'), 'Live stock', 'One stock record per size and colour, updated as orders arrive.'], [IC('package'), 'Track every step', 'Eleven order stages with a notice by email or WhatsApp.'], [IC('arrow-left-right'), 'Two currencies', 'Pay in PKR or GBP with a 30 minute rate lock.']].map(([i, t, d]) => `<div class="card"><div class="feat">${i}</div><h3>${t}</h3><p class="mute">${d}</p></div>`).join('')}</div>`;
  }
  function shop(cat) {
    const f = ui.f; if (cat && cat !== f.cat) { f.cat = cat; f.sub = 'All'; }
    let ps = Object.values(S().products).filter(p => (f.cat === 'All' || p.cat === f.cat) && (f.sub === 'All' || p.sub === f.sub) && (!f.q || (p.name + p.sub + p.cat).toLowerCase().includes(f.q.toLowerCase())));
    ps.sort((a, b) => f.sort === 'lo' ? a.price - b.price : f.sort === 'hi' ? b.price - a.price : 0);
    const subs = ['All', ...new Set(Object.values(S().products).filter(p => f.cat === 'All' || p.cat === f.cat).map(p => p.sub))];
    return `<h2>Shop</h2><div class="chips">${['All', 'Shoes', 'Handbags', 'Accessories'].map(c => `<button class="chip ${f.cat === c ? 'on' : ''}" data-a="fcat" data-v="${c}">${c}</button>`).join('')}</div>
      <div class="chips">${subs.map(c => `<button class="chip ${f.sub === c ? 'on' : ''}" data-a="fsub" data-v="${c}">${c}</button>`).join('')}</div>
      <div class="row sp"><span class="mute">${ps.length} products</span><select data-c="sort" style="width:auto" aria-label="Sort"><option value="feat">Featured</option><option value="lo" ${f.sort === 'lo' ? 'selected' : ''}>Price: low to high</option><option value="hi" ${f.sort === 'hi' ? 'selected' : ''}>Price: high to low</option></select></div>
      <div class="grid" style="margin-top:.6rem">${ps.map(productCard).join('') || App.empty('search-x', 'No products match', 'Try a different search or clear the filters.', '<button class="btn sm" data-a="fclear">Clear filters</button>')}</div>`;
  }
  function product(id) {
    const p = P(id); if (!p) return '<p>Product not found.</p>'; const sel = ui.sel[id] = ui.sel[id] || { ci: 0, size: null }, c = p.colours[sel.ci];
    const cm = { 36: [3, 22.8], 37: [4, 23.5], 38: [5, 24.1], 39: [6, 24.8], 40: [7, 25.4], 41: [8, 26.0] };
    const wl = ui.user && (ui.user.wish || []).includes(id);
    return `<a class="backlink" href="#/shop">${IC('arrow-left')} Back to shop</a><div class="grid g2" style="margin-top:.6rem"><div class="card">${App.img(p, sel.ci, p.name + ' in ' + c.name, 'border-radius:12px')}</div>
      <div><span class="badge">${esc(p.cat)} · ${esc(p.sub)}</span><h1>${esc(p.name)}</h1><div class="pr" style="font-size:1.4rem">${price(p)}</div><p class="mute">${esc(p.blurb)} <span class="ic-line">${IC('star', 'star filled')} ${p.rating}</span></p>
      <label>Colour: ${esc(c.name)}</label><div class="row">${p.colours.map((k, i) => `<button class="sw ${i === sel.ci ? 'on' : ''}" style="background:${k.c1}" data-a="pcol" data-id="${id}" data-v="${i}" aria-label="${esc(k.name)}"></button>`).join('')}</div>
      <label>Size</label><div class="row">${p.sizes.map(s => { const a = DB.avail(vkey(id, sel.ci, s)); return `<button class="sz ${sel.size === s ? 'on' : ''}" data-a="psize" data-id="${id}" data-v="${s}" ${a <= 0 ? 'disabled' : ''}>${s}</button>`; }).join('')}</div>
      <p>${sel.size ? stockBadge(DB.avail(vkey(id, sel.ci, sel.size))) + ' in this size' : '<span class="mute">Choose a size to see live stock</span>'}</p>
      <div class="row"><button class="btn" data-a="padd" data-id="${id}">${IC('shopping-cart')} Add to cart</button><button class="btn alt" data-a="wish" data-id="${id}">${IC('heart', wl ? 'filled' : '')} Wish list</button><a class="btn wa" target="_blank" rel="noopener" href="${wa('Hello Metro Shoes, I have a question about ' + p.name + ' (' + c.name + ').')}">${WAIC} WhatsApp us</a></div>
      ${p.cat === 'Shoes' ? `<h3 style="margin-top:1rem">Size guide</h3><table class="sizeg"><tr><th>EU</th>${Object.keys(cm).map(k => `<td>${k}</td>`).join('')}</tr><tr><th>UK</th>${Object.values(cm).map(v => `<td>${v[0]}</td>`).join('')}</tr><tr><th>Foot cm</th>${Object.values(cm).map(v => `<td>${v[1]}</td>`).join('')}</tr></table>` : ''}</div></div>`;
  }
  function summary(r, withLines) {
    return `<div class="sum">${withLines ? r.lines.map(l => `<div><span>${esc(l.name)} × ${l.qty}</span><span>${M(l.total)}</span></div>`).join('') : ''}<div><span>Goods</span><span>${M(r.goods)}</span></div>
    ${r.bundle ? `<div class="d"><span>Bundle (shoes + handbag)</span><span>− ${M(r.bundle)}</span></div>` : ''}${r.loyalty ? `<div class="d"><span>${r.loyaltyTier} loyalty</span><span>− ${M(r.loyalty)}</span></div>` : ''}${r.promo ? `<div class="d"><span>Promo ${esc(ui.promo.toUpperCase())}</span><span>− ${M(r.promo)}</span></div>` : ''}${r.capped ? '<div class="mute small"><span>Discount capped at 30% of full-price goods</span></div>' : ''}
    <div><span>Delivery</span><span>${r.delivery ? M(r.delivery) : 'Free'}</span></div>${r.cod ? `<div><span>Cash on delivery fee</span><span>${M(r.cod)}</span></div>` : ''}<div class="t"><span>Total</span><span>${M(r.total)}</span></div><div class="mute small"><span>Includes tax (${r.taxRate}%)</span><span>${M(r.tax)}</span></div></div>`;
  }
  function cart() {
    const r = App.priceNow(), L = lines();
    if (!L.length) return '<h2>Your cart</h2><div class="card">' + App.empty('shopping-cart', 'Your cart is empty', 'Add shoes, handbags or accessories and they will appear here.', '<a class="btn" href="#/shop">' + IC('shopping-bag') + ' Start shopping</a>') + '</div>';
    return `<h2>Your cart</h2><div class="grid g2"><div class="card">${L.map((l, i) => { const p = P(l.pid), a = DB.avail(l.id); return `<div class="row sp" style="border-bottom:1px solid var(--line);padding:.5rem 0"><div class="row">${App.img(p, l.ci, '', 'width:72px;border-radius:8px')}<div><b>${esc(l.name)}</b><br>${a < l.qty ? '<span class="badge out">Only ' + Math.max(a, 0) + ' available</span>' : stockBadge(a)}</div></div>
      <div class="row"><button class="btn sm alt icon" data-a="qty" data-i="${i}" data-d="-1" aria-label="Fewer">${IC('minus')}</button><b>${l.qty}</b><button class="btn sm alt icon" data-a="qty" data-i="${i}" data-d="1" aria-label="More">${IC('plus')}</button><button class="btn sm alt destructive icon" data-a="rm" data-i="${i}" aria-label="Remove">${IC('trash-2')}</button></div></div>`; }).join('')}
      <label for="promo">Promo code</label><div class="row"><input id="promo" value="${esc(ui.promo)}" placeholder="WELCOME10" style="flex:1"><button class="btn" data-a="promo">Apply</button></div>${r.promoMsg ? `<div class="err">${esc(r.promoMsg)}</div>` : ''}</div>
      <div class="card"><h3>Order summary</h3>${summary(r)}${r.limitMsg ? `<div class="notice bad">${esc(r.limitMsg)}</div>` : ''}<a class="btn gold" style="width:100%;margin-top:.6rem" href="#/checkout">Checkout ${IC('arrow-right')}</a></div></div>`;
  }
  function checkout() {
    const L = lines(); if (!L.length) return '<p>Your cart is empty. <a href="#/shop">Shop</a></p>';
    const u = ui.user || {}, uk = ui.cur === 'GBP', st = Logic.rateStatus(S().settings), r = App.priceNow(); App.ck = App.ck || {};
    const v = k => esc(App.ck[k] != null ? App.ck[k] : (k === 'name' ? u.name : k === 'email' ? u.email : k === 'mobile' ? u.mobile : k === 'line' ? (u.addr && u.addr[0] ? u.addr[0].line : '') : '') || '');
    return `<h2>Checkout (${uk ? 'United Kingdom, GBP' : 'Pakistan, PKR'})</h2>${!st.ok && uk ? '<div class="notice bad">The exchange rate is more than 72 hours old, so UK checkout is paused. Please switch to PKR or try later.</div>' : `<div class="notice ok">Your GBP prices are locked for 30 minutes once you place the order. Rate: ${rateLine()}</div>`}
    <div class="grid g2"><form class="card" id="ckf" novalidate><h3>Your details</h3>${[['name', 'Full name', 'e.g. Ayesha Khan'], ['email', 'Email', 'name@example.com'], ['mobile', uk ? 'Mobile (+44 7xxx xxxxxx)' : 'Mobile (+92 3xx xxxxxxx)', uk ? '+44 7700 900123' : '+92 300 1234567'], ['line', 'Delivery address', 'House number, street, area'], ...(uk ? [['postcode', 'Postcode', 'e.g. BD1 1AA']] : [['city', 'City', 'e.g. Lahore']])].map(([k, l, ph]) => `<label for="f_${k}">${l}</label><input id="f_${k}" name="${k}" value="${v(k)}" placeholder="${ph}"><div class="err" id="e_${k}"></div>`).join('')}
      <h3 style="margin-top:1rem">Payment</h3>${[['CARD', 'Sandbox card (test mode)'], ...(uk ? [] : [['COD', 'Cash on delivery (up to Rs 50,000, Rs 100 fee)'], ['BANK', 'Bank transfer (confirm within 48 hours)']])].map(([k, l]) => `<label class="row" style="font-weight:400"><input type="radio" name="pay" value="${k}" ${ui.pay === k ? 'checked' : ''} data-c="pay"> ${l}</label>`).join('')}
      ${ui.pay === 'CARD' ? '<label for="f_card">Card number (test: 4242 4242 4242 4242)</label><input id="f_card" name="card" inputmode="numeric" autocomplete="off" placeholder="4242 4242 4242 4242"><div class="err" id="e_card"></div>' : ''}
      <button class="btn gold" type="submit" style="margin-top:1rem" ${(uk && !st.ok) || !r.valid ? 'disabled' : ''}>${IC('lock')} Place order</button></form>
      <div class="card"><h3>Order summary</h3>${summary(r, true)}${r.limitMsg ? `<div class="notice bad">${esc(r.limitMsg)}</div>` : ''}${r.payMsg ? `<div class="notice bad">${esc(r.payMsg)}</div>` : ''}</div></div>`;
  }
  function placeOrder(f) {
    const r = App.priceNow(), uk = ui.cur === 'GBP', e = Logic.validate({ email: f.email, mobile: f.mobile, postcode: f.postcode, region: uk ? 'UK' : 'PK' });
    if (!f.name.trim()) e.name = 'Enter your name'; if (!f.line.trim()) e.line = 'Enter your delivery address'; if (!uk && !(f.city || '').trim()) e.city = 'Enter your city';
    if (ui.pay === 'CARD') { const n = (f.card || '').replace(/\s/g, ''); if (n === '4000000000000002') e.card = 'Card declined (sandbox test card)'; else if (n !== '4242424242424242') e.card = 'Use a sandbox test card'; }
    document.querySelectorAll('.err[id^=e_]').forEach(x => x.textContent = e[x.id.slice(2)] || ''); if (Object.keys(e).length) { App.toast('Please correct the highlighted fields'); return; }
    for (const l of r.lines) if (DB.avail(l.id) < l.qty) { App.toast(l.name + ' is no longer available in that quantity'); return; }
    if (!r.valid) { App.toast(r.limitMsg || r.payMsg || 'Order cannot be placed'); return; }
    let id; const now = Date.now();
    DB.tx(s => {
      id = 'MS-' + (++s.seq); r.lines.forEach(l => { s.stock[l.id].r += l.qty; });
      s.orders[id] = { id, uid: ui.user ? ui.user.id : null, guest: { name: f.name, email: f.email, mobile: f.mobile }, placedAt: now, stage: 'Awaiting confirmation', cur: ui.cur, payment: ui.pay, card4: ui.pay === 'CARD' ? f.card.replace(/\s/g, '').slice(-4) : null, promo: r.promo ? ui.promo.toUpperCase() : null, fx: s.settings.fx.pkrPerGbp, lockUntil: now + 30 * 6e4, addr: f.line + (f.postcode ? ', ' + f.postcode : f.city ? ', ' + f.city : ''),
        items: ui.cart.map(i => ({ ...i })), totals: { goods: r.goods, discounts: r.discounts, delivery: r.delivery, cod: r.cod, total: r.total, tax: r.tax }, log: [{ t: now, stage: 'Placed', by: 'customer' }, { t: now, stage: 'Awaiting confirmation', by: 'system' }], contacts: [] };
    }, ['seq', 'stock', 'orders']);
    App.notify(id, 'Order placed', `Thank you for your order ${id}. Total ${M(r.total, ui.cur)}. We will contact you to confirm it.`);
    DB.log('Order ' + id + ' placed (' + ui.cur + ' ' + r.total + ')', 'customer'); ui.cart = []; ui.promo = ''; App.ck = null; saveCart(); App.go('/order/' + id);
  }
  /* notifications: stored in the outbox (simulated send) and opened with wa.me / mailto links */
  App.notify = (id, subject, body) => { const o = S().orders[id], to = App.contactOf(o); ['email', 'whatsapp'].forEach(ch => { const rec = ch === 'email' ? to.email : to.mobile; DB.msg({ orderId: id, uid: o.uid, channel: ch, to: rec, subject, body }); if (CFG.notifyEndpoint && /^https?:/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname)) fetch(CFG.notifyEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: ch, to: rec, subject, text: body }), keepalive: true }).catch(() => { }); }); };
  App.contactOf = o => { const u = o.uid && S().users[o.uid]; return u ? { name: u.name, email: u.email, mobile: u.mobile } : o.guest; };
  App.orderTotal = o => M(o.totals.total, o.cur);
  App.timeline = o => { const done = o.log.map(l => l.stage), cancelled = ['Cancelled', 'Returned'].includes(o.stage), path = Logic.STAGES.slice(0, 9);
    return `<ol class="tl">${(cancelled ? [...path.slice(0, Math.max(2, path.findIndex(s => !done.includes(s)))), o.stage] : path).map(s => { const l = o.log.find(x => x.stage === s); return `<li class="${s === o.stage ? (cancelled ? 'bad' : 'now') : l ? 'done' : ''}"><b>${s}</b>${l ? `<span class="mute small"> · ${new Date(l.t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>` : ''}</li>`; }).join('')}</ol>`; };
  function orderPage(id) {
    const o = S().orders[id]; if (!o) return '<p>Order not found.</p>'; const c = App.contactOf(o), txt = `Hello Metro Shoes, my order is ${o.id} (${App.orderTotal(o)}). Current status: ${o.stage}.`;
    return `<div class="notice ok"><b>Thank you, ${esc(c.name)}.</b> Order ${o.id} is ${esc(o.stage.toLowerCase())}. A confirmation notice is in the outbox and can be sent now:</div>
    <div class="grid g2"><div class="card"><h3>Order ${o.id}</h3>${App.timeline(o)}<div class="row"><a class="btn wa" target="_blank" rel="noopener" href="${wa(txt)}">${WAIC} WhatsApp the shop</a><a class="btn alt" href="${mail(CFG.shopEmail, 'Order ' + o.id, txt)}">${IC('mail')} Email the shop</a><a class="btn alt" href="#/track">${IC('search')} Track another order</a></div></div>
    <div class="card"><h3>Items</h3>${o.items.map(i => { const p = P(i.pid); return `<div class="row sp"><span>${esc(p.name)} (${esc(p.colours[i.ci].name)}, ${i.size}) × ${i.qty}</span></div>`; }).join('')}<hr><div class="sum"><div><span>Total (${o.cur})</span><b>${App.orderTotal(o)}</b></div><div class="mute small"><span>Delivery to</span><span>${esc(o.addr)}</span></div><div class="mute small"><span>Payment</span><span>${{ CARD: 'Sandbox card •••• ' + o.card4, COD: 'Cash on delivery', BANK: 'Bank transfer' }[o.payment]}</span></div></div></div></div>`;
  }
  function track() {
    const t = App.tr || {}, o = t.id && S().orders[t.id.trim().toUpperCase()], c = o && App.contactOf(o), ok = o && c.email.toLowerCase() === (t.email || '').trim().toLowerCase();
    return `<h2>Track your order</h2><form class="card" id="trf" style="max-width:520px"><label for="t_id">Order number</label><input id="t_id" value="${esc(t.id || '')}" placeholder="MS-1004"><label for="t_em">Email used for the order</label><input id="t_em" value="${esc(t.email || '')}" placeholder="ayesha@example.com"><button class="btn" style="margin-top:.8rem">${IC('search')} Track</button></form>
    ${t.id ? (ok ? `<div class="card" style="margin-top:1rem">${orderPage(o.id).replace(/<div class="notice ok">.*?<\/div>/, '')}</div>` : '<div class="notice bad" style="margin-top:1rem">We could not find that order number with that email.</div>') : ''}`;
  }
  function contact() {
    const stores = [['Lahore – Liberty Market', '+92 42 3555 0101'], ['Karachi – Dolmen Mall', '+92 21 3555 0102'], ['Islamabad – Centaurus', '+92 51 3555 0103'], ['Bradford – UK fulfilment desk', '+44 1274 555 0104']];
    return `<h2>Contact Metro Shoes</h2><div class="grid g2"><form class="card" id="cf"><label for="c_n">Your name</label><input id="c_n" placeholder="e.g. Ayesha Khan"><label for="c_m">Message</label><textarea id="c_m" rows="4" placeholder="How can we help?"></textarea><div class="row" style="margin-top:.8rem"><button class="btn wa" data-a="cwa" type="button">${WAIC} Send on WhatsApp</button><button class="btn alt" data-a="cmail" type="button">${IC('send')} Send by email</button></div></form>
    <div class="card"><h3>Stores and service desk</h3>${stores.map(([a, b]) => `<p><b>${a}</b><br>${b}</p>`).join('')}<p class="mute small">Opening hours: Monday to Saturday, 10:00 to 20:00 (PKT).</p></div></div>`;
  }
  function login(reg) {
    return `<div style="max-width:460px;margin:0 auto"><h2>${reg ? 'Create your account' : 'Sign in'}</h2><form class="card" id="${reg ? 'rgf' : 'lgf'}" novalidate>${reg ? '<label for="r_n">Full name</label><input id="r_n" placeholder="e.g. Ayesha Khan"><div class="err" id="e_name"></div><label for="r_m">Mobile (+92 3xx xxxxxxx or +44 7xxx xxxxxx)</label><input id="r_m" placeholder="+92 300 1234567"><div class="err" id="e_mobile"></div>' : ''}<label for="l_e">Email</label><input id="l_e" type="email" autocomplete="username" placeholder="name@example.com"><div class="err" id="e_email"></div><label for="l_p">Password</label><input id="l_p" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" placeholder="${reg ? 'Choose a password' : 'Your password'}"><div class="err" id="e_password"></div><button class="btn" style="margin-top:.8rem;width:100%;justify-content:center">${reg ? IC('user-plus') + ' Register' : IC('log-in') + ' Sign in'}</button><p class="small">${reg ? '<a href="#/login">Already registered? Sign in</a>' : '<a href="#/register">New customer? Register</a> · <a href="#" data-a="demo">Demo accounts</a>'}</p></form></div>`;
  }
  function policy(k) {
    const s = S().settings, fmt = (a, c) => a.map(([ub, fee], i) => { const prev = i ? a[i - 1][0] : 0; return ub >= 1e9 ? `${M(prev, c)} and over: ${fee ? M(fee, c) : 'free'}` : `${i ? M(prev, c) + ' to under ' : 'Under '}${M(ub, c)}: ${fee ? M(fee, c) : 'free'}`; });
    const P = {
      about: ['About Metro Shoes', `<p>Metro Shoes is a fashion retailer for shoes, handbags and accessories with stores in Pakistan and a growing online shop for customers in Pakistan and the United Kingdom.</p><p>This website is a demonstration build: orders, payments and messages are sandbox only, and no real goods are sold.</p><h3>Our stores</h3><p>Lahore, Liberty Market · Karachi, Dolmen Mall · Islamabad, Centaurus · Bradford, UK fulfilment desk. See <a href="#/contact">Contact</a> for numbers.</p>`],
      delivery: ['Delivery and payment', `<h3>Pakistan (PKR)</h3><ul>${fmt(s.delivery.PK, 'PKR').map(x => '<li>' + x + '</li>').join('')}</ul><p>Cash on delivery is available up to ${M(s.codMax, 'PKR')} with a ${M(s.codFee, 'PKR')} fee. Bank transfer orders must be confirmed within 48 hours.</p><h3>United Kingdom (GBP)</h3><ul>${fmt(s.delivery.UK, 'GBP').map(x => '<li>' + x + '</li>').join('')}</ul><p>UK orders are paid by card. Prices in pounds use the exchange rate at checkout, locked for 30 minutes, and include VAT at ${s.tax.UK}%. Pakistan prices include tax at ${s.tax.PK}%.</p>`],
      returns: ['Returns and cancellations', `<ul><li>Cancel any order before it is dispatched from your account, or by WhatsApp or email.</li><li>Return delivered items within <b>14 days</b> of delivery from My orders. Returned items are checked and restocked.</li><li>Orders that are not confirmed within 24 hours (48 hours for bank transfer) are cancelled automatically and any reserved stock is released.</li><li>Refunds go back to the original payment method.</li></ul>`],
      privacy: ['Privacy', `<p>We keep the details needed to take and deliver your order: name, email, mobile number, delivery address and order history. Card numbers are never stored; the sandbox keeps only the last four digits.</p><ul><li>Your cart and preferences are saved in your browser.</li><li>Orders, stock and settings are stored in the shop database (Firebase Realtime Database when configured, otherwise your browser).</li><li>Order notices are sent by email and WhatsApp, and you can contact us to correct or delete your details.</li></ul><p>This is a demonstration site. Do not enter real card details.</p>`]
    }[k]; return `<h2>${P[0]}</h2><div class="card" style="max-width:760px;line-height:1.7">${P[1]}</div>`;
  }
  /* ---------- router ---------- */
  App.render = function () {
    const S0 = S(); if (!S0) return; const h = (location.hash || '#/').slice(1), [, a, b] = h.split('/'), app = $('#app'), r = a || '';
    if (['dash', 'staff'].includes(r)) { const u = ui.user; if (!u) { App.go('/login'); return; } app.innerHTML = shellDash(u, b); App.afterDash && App.afterDash(); return; }
    const pages = { '': home, shop: () => shop(b), product: () => product(b), cart, checkout, track, contact, order: () => orderPage(b), login: () => login(), register: () => login(true), about: () => policy('about'), delivery: () => policy('delivery'), returns: () => policy('returns'), privacy: () => policy('privacy') };
    app.innerHTML = shell((pages[r] || home)()); document.title = 'Metro Shoes – ' + (r || 'home'); if (!App._noscroll) window.scrollTo(0, 0);
  };
  const shellDash = (u, sec) => window.Dash.render(u, sec);
  /* ---------- actions ---------- */
  const A = App.A;
  A.cur = t => { ui.cur = t.dataset.v; localStorage.mcur = ui.cur; if (ui.cur === 'GBP' && ui.pay !== 'CARD') ui.pay = 'CARD'; App._noscroll = 1; App.render(); App._noscroll = 0; };
  A.menu = (t, e) => { e.stopPropagation(); const m = t.nextElementSibling; m.classList.toggle('on'); t.setAttribute('aria-expanded', m.classList.contains('on')); };
  A.theme = () => { const d = document.documentElement; d.dataset.theme = d.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.mtheme = d.dataset.theme; };
  A.rate = () => { DB.tx(s => { s.settings.fx.updated = Date.now(); s.settings.fx.outage = false; }, ['settings']); App.toast('Exchange rate refreshed'); };
  A.about = () => App.modal(`<h2>About</h2><p>Metro Shoes web application v${CFG.version}. Customer storefront, order processing, owner dashboard and live inventory on one shared stock record per variant. Data mode: ${esc(DB.status)}.</p><button class="btn" data-a="close">Close</button>`);
  A.demo = () => App.modal(`<h2>Demo accounts</h2><table class="tbl"><tr><th>Role</th><th>Email</th><th>Password</th></tr>${[['Customer (Pakistan, Silver)', 'ayesha@example.com', 'Demo1234'], ['Customer (UK)', 'sarah@example.com', 'Demo1234'], ['Order Handler', 'handler@metroshoes.test', 'Staff1234'], ['Warehouse', 'warehouse@metroshoes.test', 'Staff1234'], ['Owner / Admin', 'admin@metroshoes.test', 'Staff1234']].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table><p class="small mute">Test cards: 4242 4242 4242 4242 accepted, 4000 0000 0000 0002 declined. Promo codes: WELCOME10, FLAT500 (EXPIRED5 is expired).</p><button class="btn" data-a="close">Close</button>`);
  A.install = () => { if (App.dip) { App.dip.prompt(); } else App.toast('Use your browser menu: Add to Home screen'); };
  A.fclear = () => { ui.f = { cat: 'All', sub: 'All', q: '', sort: 'feat' }; App.render(); };
  A.fcat = t => { ui.f.cat = t.dataset.v; ui.f.sub = 'All'; App.render(); }; A.fsub = t => { ui.f.sub = t.dataset.v; App.render(); };
  A.wish = t => { const u = ui.user; if (!u) { App.toast('Sign in to keep a wish list'); return; } DB.tx(s => { const w = s.users[u.id].wish = s.users[u.id].wish || []; const i = w.indexOf(t.dataset.id); i < 0 ? w.push(t.dataset.id) : w.splice(i, 1); }, ['users']); ui.user = S().users[u.id]; App._noscroll = 1; App.render(); App._noscroll = 0; };
  A.pcol = t => { ui.sel[t.dataset.id] = { ci: +t.dataset.v, size: null }; App._noscroll = 1; App.render(); App._noscroll = 0; };
  A.psize = t => { const s = ui.sel[t.dataset.id]; s.size = isNaN(t.dataset.v) ? t.dataset.v : +t.dataset.v; App._noscroll = 1; App.render(); App._noscroll = 0; };
  A.padd = t => { const s = ui.sel[t.dataset.id]; if (s.size == null) { App.toast('Please choose a size'); return; } if (addToCart(t.dataset.id, s.ci, s.size, 1)) App.render(); };
  A.quick = t => { const p = P(t.dataset.id); ui.q = { id: p.id, ci: 0, size: null }; App.modal(quickHtml()); };
  const quickHtml = () => { const q = ui.q, p = P(q.id), c = p.colours[q.ci]; return `<h2>${esc(p.name)}</h2>${App.img(p, q.ci, p.name + ' in ' + c.name, 'border-radius:12px')}<label>Colour</label><div class="row">${p.colours.map((k, i) => `<button class="sw ${i === q.ci ? 'on' : ''}" style="background:${k.c1}" data-a="qcol" data-v="${i}" aria-label="${esc(k.name)}"></button>`).join('')}</div><label>Size</label><div class="row">${p.sizes.map(s => `<button class="sz ${q.size === s ? 'on' : ''}" data-a="qsize" data-v="${s}" ${DB.avail(vkey(p.id, q.ci, s)) <= 0 ? 'disabled' : ''}>${s}</button>`).join('')}</div><div class="row" style="margin-top:1rem"><button class="btn" data-a="qadd">${IC('shopping-cart')} Add to cart</button><button class="btn alt" data-a="close">Cancel</button></div>`; };
  A.qcol = t => { ui.q.ci = +t.dataset.v; ui.q.size = null; $('.modal').innerHTML = quickHtml(); }; A.qsize = t => { ui.q.size = isNaN(t.dataset.v) ? t.dataset.v : +t.dataset.v; $('.modal').innerHTML = quickHtml(); };
  A.qadd = () => { if (ui.q.size == null) { App.toast('Please choose a size'); return; } if (addToCart(ui.q.id, ui.q.ci, ui.q.size, 1)) { A.close(); App.render(); } };
  A.close = () => { $('#layer').innerHTML = ''; };
  App.modal = h => { $('#layer').innerHTML = `<div class="ov" data-a="ovl"><div class="modal" role="dialog" aria-modal="true">${h}</div></div>`; };
  A.ovl = (t, e) => { if (e.target === t) A.close(); };
  A.qty = t => { const i = ui.cart[+t.dataset.i], d = +t.dataset.d, k = vkey(i.pid, i.ci, i.size); if (d > 0 && (DB.avail(k) < i.qty + 1 || i.qty + 1 > S().settings.limits.maxQty)) { App.toast('No more available for that variant'); return; } i.qty = Math.max(1, i.qty + d); saveCart(); App._noscroll = 1; App.render(); App._noscroll = 0; if ($('.drawer')) A.cartdrawer(); };
  A.rm = t => { ui.cart.splice(+t.dataset.i, 1); saveCart(); App._noscroll = 1; App.render(); App._noscroll = 0; if ($('.drawer')) A.cartdrawer(); };
  A.promo = () => { ui.promo = $('#promo').value.trim(); App._noscroll = 1; App.render(); App._noscroll = 0; };
  A.cartdrawer = () => { const L = lines(), r = App.priceNow(); $('#layer').innerHTML = `<div class="ov" data-a="ovl" style="justify-content:flex-end;padding:0"><aside class="drawer" aria-label="Mini cart"><div class="row sp"><h2>Cart</h2><button class="btn sm alt" data-a="close">${IC('x')} Close</button></div>${L.length ? L.map((l, i) => `<div class="row sp" style="padding:.4rem 0;border-bottom:1px solid var(--line)"><span>${esc(l.name)}<br><span class="mute small">${M(l.total || Logic.unit(l.sale != null && l.sale < l.price ? l.sale : l.price, ui.cur, S().settings) * l.qty)}</span></span><span class="row"><button class="btn sm alt icon" data-a="qty" data-i="${i}" data-d="-1" aria-label="Fewer">${IC('minus')}</button><b>${l.qty}</b><button class="btn sm alt icon" data-a="qty" data-i="${i}" data-d="1" aria-label="More">${IC('plus')}</button></span></div>`).join('') + `<div class="sum" style="margin-top:.6rem"><div class="t"><span>Total</span><span>${M(r.total)}</span></div></div><div class="row" style="margin-top:.6rem"><a class="btn alt" href="#/cart" data-a="close">View cart</a><a class="btn gold" href="#/checkout" data-a="close">Checkout</a></div>` : App.empty('shopping-cart', 'Your cart is empty', 'Items you add will show up here.')}</aside></div>`; };
  A.cwa = () => window.open(wa('Hello Metro Shoes, this is ' + ($('#c_n').value || 'a customer') + '. ' + $('#c_m').value), '_blank');
  A.cmail = () => { location.href = mail(CFG.shopEmail, 'Website enquiry', $('#c_m').value + '\n\n' + $('#c_n').value); };
  document.addEventListener('click', e => { const t = e.target.closest('[data-a]'); document.querySelectorAll('.menu.on').forEach(m => { if (!m.contains(e.target) && !(t && t.dataset.a === 'menu')) m.classList.remove('on'); }); if (t && A[t.dataset.a]) { if (t.tagName === 'A' && t.dataset.a === 'close') { A.close(); return; } A[t.dataset.a](t, e); } });
  document.addEventListener('change', e => { const c = e.target.dataset.c; if (c === 'sort') { ui.f.sort = e.target.value; App.render(); } if (c === 'pay') { ui.pay = e.target.value; App.ck = Object.fromEntries(new FormData($('#ckf'))); App._noscroll = 1; App.render(); App._noscroll = 0; } });
  document.addEventListener('input', e => { if (e.target.id !== 'q') return; const v = e.target.value.trim().toLowerCase(), box = $('#sug'); if (!v) { box.hidden = true; return; } const m = Object.values(S().products).filter(p => (p.name + p.sub).toLowerCase().includes(v)).slice(0, 5); box.hidden = !m.length; box.innerHTML = m.map(p => `<a href="#/product/${p.id}"><img src="${App.pic(p, 0)}" alt=""><span><b>${esc(p.name)}</b><br><span class="mute small">${esc(p.sub)}</span></span></a>`).join(''); });
  document.addEventListener('keydown', e => { if (e.target.id === 'q' && e.key === 'Enter') { ui.f = { cat: 'All', sub: 'All', q: e.target.value, sort: 'feat' }; App.go('/shop'); App.render(); } });
  document.addEventListener('submit', async e => {
    e.preventDefault(); const id = e.target.id, g = k => (e.target.querySelector(k) || {}).value || '';
    if (id === 'ckf') placeOrder(Object.fromEntries(new FormData(e.target)));
    if (id === 'trf') { App.tr = { id: g('#t_id'), email: g('#t_em') }; App._noscroll = 1; App.render(); App._noscroll = 0; }
    if (id === 'lgf') { const u = Object.values(S().users).find(x => x.email.toLowerCase() === g('#l_e').trim().toLowerCase()); if (!u || u.pwh !== await DB.sha(u.id + ':' + g('#l_p'))) { $('#e_password').textContent = 'Email or password is incorrect'; return; } App.signIn(u); }
    if (id === 'rgf') { const f = { email: g('#l_e'), mobile: g('#r_m'), password: g('#l_p') }, er = Logic.validate(f); if (!g('#r_n').trim()) er.name = 'Enter your name'; if (Object.values(S().users).some(x => x.email.toLowerCase() === f.email.toLowerCase())) er.email = 'That email is already registered'; document.querySelectorAll('.err').forEach(x => x.textContent = er[x.id.slice(2)] || ''); if (Object.keys(er).length) return; const uid = DB.uid('u'), reg = f.mobile.startsWith('+44') ? 'UK' : 'PK'; const pwh = await DB.sha(uid + ':' + f.password); DB.tx(s => { s.users[uid] = { id: uid, role: 'customer', name: g('#r_n').trim(), email: f.email, mobile: f.mobile, region: reg, pwh, spend12m: 0, addr: [], wish: [], cur: reg === 'UK' ? 'GBP' : 'PKR' }; }, ['users']); App.signIn(S().users[uid]); }
  });
  App.signIn = u => { ui.user = u; sessionStorage.msess = u.id; if (u.cur && u.role === 'customer') { ui.cur = u.cur; localStorage.mcur = ui.cur; } DB.log('Signed in: ' + u.email, u.name); App.go(u.role === 'customer' ? '/dash' : '/staff'); App.toast('Welcome, ' + u.name.split(' ')[0]); };
  App.signOut = () => { ui.user = null; sessionStorage.removeItem('msess'); App.go('/'); App.toast('Signed out'); };
  /* auto-cancel unconfirmed orders past their deadline and release reserved stock */
  App.sweep = () => { const now = Date.now(); Object.values(S().orders).forEach(o => { if (o.stage === 'Awaiting confirmation' && now > Logic.deadline(o)) { App.setStage(o.id, 'Cancelled', 'system', 'Automatic cancellation: not confirmed in time'); } }); };
  App.setStage = (id, to, by, note) => {
    DB.tx(s => { const o = s.orders[id], from = o.stage;
      o.items.forEach(i => { const k = vkey(i.pid, i.ci, i.size), st = s.stock[k]; if (to === 'Confirmed') { st.h -= i.qty; st.r -= i.qty; } if (to === 'Cancelled') { from === 'Awaiting confirmation' || from === 'Placed' ? st.r -= i.qty : st.h += i.qty; } if (to === 'Returned') st.h += i.qty; });
      if (to === 'Delivered' && o.uid) s.users[o.uid].spend12m += o.cur === 'GBP' ? Math.round(o.totals.total * o.fx) : o.totals.total;
      o.stage = to; (o.log = o.log || []).push({ t: Date.now(), stage: to, by, note: note || '' }); }, ['orders', 'stock', 'users']);
    App.notify(id, 'Order ' + id + ': ' + to, `Your order ${id} is now: ${to}.`); DB.log(`Order ${id} moved to ${to}`, by);
  };
  App.start = async function () {
    document.documentElement.dataset.theme = localStorage.mtheme || 'light'; window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); App.dip = e; });
    await DB.init(); const sid = sessionStorage.msess; if (sid && S().users[sid]) ui.user = S().users[sid];
    DB.on(() => { if (ui.user) ui.user = S().users[ui.user.id] || null; const a = document.activeElement; if (!a || !/INPUT|TEXTAREA|SELECT/.test(a.tagName)) { App._noscroll = 1; App.render(); App._noscroll = 0; } });
    window.addEventListener('hashchange', App.render); App.render(); setInterval(App.sweep, 15000); if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
  };
})();
