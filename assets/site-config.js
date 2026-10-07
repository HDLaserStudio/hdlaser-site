// Site-wide settings. Edit values here; every page reads them.
window.HD_CONFIG = {
  // Cloudflare Worker URL that creates Square checkout pages, e.g. "https://hdlaser-checkout.<account>.workers.dev/checkout".
  // Leave empty to fall back to plain quote requests (no online payment).
  CHECKOUT_ENDPOINT: "https://hdlaser-checkout.yellow-smoke-9c0e.workers.dev/checkout",
  // Same worker, used for cookieless funnel counts and resale-permit records. Leave empty to disable.
  WORKER_BASE: "https://hdlaser-checkout.yellow-smoke-9c0e.workers.dev",
  // Worker route that stores form submissions and emails through Resend. Leave empty to keep using Formspree.
  SUBMIT_ENDPOINT: "https://hdlaser-checkout.yellow-smoke-9c0e.workers.dev/submit",
  FORMSPREE_ENDPOINT: "https://formspree.io/f/xaenoorj",
  SETUP_FEE: 50,
  MIN_CUPS: 50,
  // Base price per cup (12 oz engraved) by order size. Printed finish and 16 oz each add $2.
  TIERS: [[200, 12], [150, 13], [100, 14], [0, 15]],
  ADD_16OZ: 2,
  ADD_PRINTED: 2
};

// Cookieless funnel beacon. One random id per browser tab session; no personal data.
window.hdTrack = function (name, ref, detail) {
  try {
    var base = window.HD_CONFIG.WORKER_BASE; if (!base) return;
    var sid = sessionStorage.getItem('hd_sid'); if (!sid) { sid = Math.random().toString(36).slice(2, 12); sessionStorage.setItem('hd_sid', sid); }
    var body = JSON.stringify({ name: name, session: sid, ref: ref || null, path: location.pathname, detail: detail || undefined });
    // text/plain keeps it a simple request (no CORS preflight), so the browser sends it; the worker reads the JSON either way
    if (navigator.sendBeacon) { navigator.sendBeacon(base + '/event', new Blob([body], { type: 'text/plain' })); }
    else { fetch(base + '/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {}); }
  } catch (e) {}
};

// Where did this visitor come from? Remembers how they first arrived (a tagged link like ?src=google-profile,
// or the site that sent them) for 90 days, so an order can say "came from the Google profile" or "from the cafe flyer".
// Kept in this browser only; it goes to the shop with an order or quote request, never anywhere else.
(function () {
  var KEY = 'hd_src';
  function clean(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 40); }
  function read() { try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && Date.now() - o.at < 90 * 864e5 ? o : null; } catch (e) { return null; } }
  window.hdSource = read;
  try {
    var p = new URLSearchParams(location.search), here = location.hostname.replace(/^www\./, '');
    var tag = clean(p.get('src') || p.get('utm_source')) || (p.get('gclid') ? 'google-ads' : '');
    var ref = ''; try { ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) {}
    if (ref === here || /workers\.dev$|squareup|square\.link/.test(ref)) ref = '';
    var old = read(), next = null;
    if (tag) next = { tag: tag, camp: clean(p.get('utm_campaign')), ref: ref, landing: location.pathname, at: Date.now() };
    else if (!old || (!old.tag && !old.ref && ref)) next = { tag: '', camp: '', ref: ref, landing: location.pathname, at: Date.now() };
    if (next && !(old && old.tag === next.tag && old.ref === next.ref)) {
      localStorage.setItem(KEY, JSON.stringify(next));
      if (p.get('via') !== 'hub' && window.hdTrack) window.hdTrack('arrival', null, { tag: next.tag, ref: next.ref, landing: next.landing });
    }
  } catch (e) {}
})();

// Google rating and review count, kept current by the worker (it asks Google once a day). Any element with
// data-g-rating or data-g-count gets the live number; the number written in the page stays if this can't load.
(function () {
  try {
    var els = document.querySelectorAll('[data-g-rating],[data-g-count]'); if (!els.length) return;
    var base = (window.HD_CONFIG || {}).WORKER_BASE; if (!base) return;
    fetch(base + '/reviews').then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.count) return;
      document.querySelectorAll('[data-g-count]').forEach(function (e) { e.textContent = Number(d.count).toLocaleString('en-US'); });
      if (d.rating) document.querySelectorAll('[data-g-rating]').forEach(function (e) { e.textContent = Number(d.rating).toFixed(1); });
    }).catch(function () {});
  } catch (e) {}
})();
