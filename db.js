/* Data layer: Firebase Realtime Database when configured, otherwise browser storage with cross-tab live sync. */
(function () {
  const KEY = 'metro_state_v2', cfg = window.METRO_CONFIG || {};
  let S = null, subs = [], mode = 'local', ref = null, status = 'Starting';
  const sha = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, '0')).join('');
  async function seeded() { const s = MetroData.seed(); for (const u of Object.values(s.users)) { u.pwh = await sha(u.id + ':' + u.pw); delete u.pw; } return s; }
  const emit = () => subs.forEach(f => f(S));
  const load = src => new Promise((res, rej) => { const e = document.createElement('script'); e.src = src; e.onload = res; e.onerror = rej; document.head.appendChild(e); });
  function persist(keys) {
    if (mode === 'firebase') { const up = {}; (keys || Object.keys(S)).forEach(k => up[k] = S[k] === undefined ? null : S[k]); ref.update(up).catch(e => { status = 'Write failed: ' + e.message; emit(); }); }
    else localStorage.setItem(KEY, JSON.stringify(S));
  }
  async function init() {
    if (cfg.firebase) {
      try {
        await load('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js'); await load('https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js');
        firebase.initializeApp(cfg.firebase); ref = firebase.database().ref('metro'); mode = 'firebase';
        await new Promise(async res => {
          let first = true;
          ref.on('value', async snap => { S = snap.val(); if (!S) { S = await seeded(); await ref.set(S); } status = 'Firebase live'; if (first) { first = false; res(); } else emit(); });
        }); return;
      } catch (e) { status = 'Firebase unavailable, using local mode'; mode = 'local'; }
    }
    const raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : await seeded(); if (!raw) localStorage.setItem(KEY, JSON.stringify(S));
    if (status === 'Starting') status = 'Local mode (live across tabs)';
    window.addEventListener('storage', e => { if (e.key === KEY && e.newValue) { S = JSON.parse(e.newValue); emit(); } });
  }
  function tx(fn, keys) { fn(S); persist(keys); emit(); }
  async function reset() { S = await seeded(); persist(); emit(); }
  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  function log(text, by) { tx(s => { const id = uid('l'); (s.logs = s.logs || {})[id] = { id, t: Date.now(), by: by || 'system', text }; }, ['logs']); }
  function msg(m) { tx(s => { const id = uid('m'); (s.msgs = s.msgs || {})[id] = { id, t: Date.now(), ...m }; }, ['msgs']); }
  const avail = vk => { const x = S.stock[vk]; return x ? x.h - x.r : 0; };
  window.DB = { init, get: () => S, tx, on: f => { subs.push(f); }, reset, sha, uid, log, msg, avail, get mode() { return mode; }, get status() { return status; } };
})();
