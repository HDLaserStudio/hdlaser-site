// Returning customers on the shop iPad (Hugh, Oct 26: "make sure the system remembers returning customers and show me their
// previous orders"). A search box: type a phone number, a name or an email, tap the person, and their details fill in and their
// past orders show underneath. It only appears on a device signed in to the hub (hd_staff_token); customers never see it.
// Use: hdCustomerFind({ mount: element, onPick: function (customer, history) {}, onClear: function () {}, onLogo: function (ref) {} or logoText: '…' })
(function () {
  var CSS = '.cf{background:#fff;border:2px solid #2B5F8A;border-radius:16px;padding:16px 18px;margin:0 0 18px;font:inherit;color:#15191E}' +
    '.cf-l{display:block;font-weight:800;font-size:18px;margin:0 0 4px}.cf-l small{font-weight:500;font-size:14px;color:#545B63}' +
    '.cf-q{width:100%;font:inherit;font-size:17px;padding:12px 14px;border:1px solid #A9A196;border-radius:12px;background:#fff;color:#15191E;box-sizing:border-box}' +
    '.cf-res{display:flex;flex-direction:column;gap:8px;margin-top:10px}.cf-res:empty{display:none}' +
    '.cf-it{display:block;width:100%;text-align:left;font:inherit;font-size:16px;padding:12px 14px;border:1px solid #D9D4CB;border-radius:12px;background:#F6F4EF;color:#15191E;cursor:pointer}' +
    '.cf-it b{font-size:17px}.cf-it span{display:block;color:#545B63;font-size:14px;margin-top:2px}.cf-it:hover,.cf-it:focus{border-color:#2B5F8A;background:#EEF3F8}' +
    '.cf-msg{color:#545B63;font-size:15px;margin-top:8px}.cf-msg:empty{display:none}' +
    '.cf-h{margin-top:12px}.cf-h[hidden]{display:none}.cf-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap}' +
    '.cf-top h3{margin:0;font-size:19px}.cf-top p{margin:2px 0 0;color:#545B63;font-size:14px}' +
    '.cf-x{font:inherit;font-size:14px;font-weight:700;padding:8px 14px;border-radius:999px;border:2px solid #15191E;background:#fff;color:#15191E;cursor:pointer}' +
    '.cf-ok{background:#E9F4EC;color:#1F6B36;border-radius:10px;padding:8px 12px;font-size:14px;font-weight:700;margin-top:10px}' +
    '.cf-tbl{width:100%;border-collapse:collapse;margin-top:10px;font-size:14px}.cf-tbl th{text-align:left;color:#545B63;font-weight:700;padding:6px 6px 6px 0;border-bottom:1px solid #E4E0D8}' +
    '.cf-tbl td{padding:8px 6px 8px 0;border-bottom:1px solid #EFEBE4;vertical-align:top}.cf-tbl td.n{text-align:right;white-space:nowrap}.cf-tbl small{color:#545B63}' +
    '.cf-pill{display:inline-block;font-size:12px;font-weight:700;padding:2px 8px;border-radius:999px;background:#EEF0F2;color:#3B434B;white-space:nowrap}' +
    '.cf-pill.done,.cf-pill.paid{background:#E9F4EC;color:#1F6B36}.cf-pill.quote{background:#E8EEF8;color:#2F4F7F}';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(c) { return '$' + ((c || 0) / 100).toFixed(2); }
  function day(iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' }); }
  var STATUS = { paid: 'Paid', done: 'Done', refunded: 'Refunded', quote: 'Quote', queued: 'In the queue', checkout_started: 'Not paid', pay_later: 'Not paid' };

  window.hdCustomerFind = function (opts) {
    var base = (window.HD_CONFIG || {}).WORKER_BASE, tok = null;
    try { tok = localStorage.getItem('hd_staff_token'); } catch (e) {}
    if (!base || !tok || !opts || !opts.mount) return null;
    if (!document.getElementById('cf-css')) { var st = document.createElement('style'); st.id = 'cf-css'; st.textContent = CSS; document.head.appendChild(st); }
    var box = document.createElement('div'); box.className = 'cf';
    box.innerHTML = '<label class="cf-l" for="cfq">Returning customer? <small>Search by phone, name or email</small></label>' +
      '<input id="cfq" class="cf-q" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="e.g. 858 555 1212, Shelby or Frost Venture">' +
      '<div class="cf-res"></div><div class="cf-msg"></div><div class="cf-h" hidden></div>';
    opts.mount.appendChild(box);
    var q = box.querySelector('.cf-q'), res = box.querySelector('.cf-res'), msg = box.querySelector('.cf-msg'), hist = box.querySelector('.cf-h'), timer = null, seq = 0;
    function get(path) {
      return fetch(base + path, { headers: { Authorization: 'Bearer ' + tok }, cache: 'no-store' }).then(function (r) {
        if (r.status === 401) throw new Error('Sign in to the hub again to search customers.');
        return r.json().then(function (d) { if (!r.ok) throw new Error((d && d.error) || 'Could not reach the shop server.'); return d; });
      });
    }
    function search(text) {
      var t = String(text || '').trim(), my = ++seq;
      if (t.length < 2 || (/^[\d\s()+.-]+$/.test(t) && t.replace(/\D/g, '').length < 3)) { res.innerHTML = ''; msg.textContent = ''; return; }
      msg.textContent = 'Searching…';
      get('/staff/customers/find?q=' + encodeURIComponent(t)).then(function (d) {
        if (my !== seq) return;
        var list = d.customers || [];
        msg.textContent = list.length ? '' : 'No one found. Fill in their details below; next time they will come up here.';
        res.innerHTML = list.map(function (c) {
          var bits = [c.phone, c.email].filter(Boolean).join(' · '), seen = c.orders ? c.orders + ' paid order' + (c.orders === 1 ? '' : 's') : 'no paid orders yet';
          return '<button type="button" class="cf-it" data-id="' + c.id + '"><b>' + esc(c.name || c.business || c.email || c.phone) + '</b>' + (c.business && c.name ? ' · ' + esc(c.business) : '') +
            '<span>' + esc(bits) + '</span><span>' + seen + (c.last_seen ? ', last seen ' + day(c.last_seen) : '') + '</span></button>';
        }).join('');
      }).catch(function (e) { if (my === seq) { res.innerHTML = ''; msg.textContent = e.message; } });
    }
    function pick(id) {
      msg.textContent = 'Loading their orders…';
      get('/staff/customers/history?id=' + encodeURIComponent(id)).then(function (d) {
        var c = d.customer, h = d.history || [];
        res.innerHTML = ''; msg.textContent = ''; q.value = '';
        var logo = h.filter(function (x) { return x.logo; })[0];
        hist.innerHTML = '<div class="cf-top"><div><h3>' + esc(c.name || c.business || c.email) + (c.business && c.name ? ' · ' + esc(c.business) : '') + '</h3>' +
          '<p>' + esc([c.phone, c.email].filter(Boolean).join(' · ')) + '</p><p>' + (c.orders ? c.orders + ' paid order' + (c.orders === 1 ? '' : 's') + ', ' + money(c.spent_cents) + ' spent' : 'No paid orders yet') + '</p></div>' +
          '<button type="button" class="cf-x">Not them? Clear</button></div>' +
          '<div class="cf-ok">' + esc(opts.filledText || 'Their name, phone and email are filled in.') + '</div>' +
          (c.note ? '<p class="cf-msg" style="display:block"><b>Note:</b> ' + esc(c.note) + '</p>' : '') +
          (logo ? '<p class="cf-msg" style="display:block">We have their logo from order <b>' + esc(logo.ref) + '</b>. ' + (opts.onLogo ? '<button type="button" class="cf-x" data-logo="' + esc(logo.ref) + '">Use their logo on file</button>' : esc(opts.logoText || '')) + '</p>' : '') +
          (h.length ? '<table class="cf-tbl"><tr><th>Date</th><th>What they ordered</th><th class="n">Amount</th></tr>' + h.slice(0, 12).map(function (x) {
            var st = STATUS[x.status] || x.status || '';
            return '<tr><td style="white-space:nowrap">' + day(x.at) + '<br><small>' + esc(x.kind) + (x.ref ? ' · ' + esc(x.ref) : '') + '</small></td><td>' + esc(x.what || '—') +
              (x.notes ? '<br><small>' + esc(x.notes) + '</small>' : '') + '</td><td class="n">' + (x.total_cents ? money(x.total_cents) + '<br>' : '') + (st ? '<span class="cf-pill ' + esc(x.status) + '">' + esc(st) + '</span>' : '') + '</td></tr>';
          }).join('') + '</table>' + (h.length > 12 ? '<p class="cf-msg" style="display:block">And ' + (h.length - 12) + ' older.</p>' : '') : '<p class="cf-msg" style="display:block">No past orders on file yet.</p>');
        hist.hidden = false;
        if (opts.onPick) opts.onPick(c, h);
      }).catch(function (e) { msg.textContent = e.message; });
    }
    q.addEventListener('input', function () { clearTimeout(timer); var v = q.value; timer = setTimeout(function () { search(v); }, 300); });
    res.addEventListener('click', function (e) { var b = e.target.closest('.cf-it'); if (b) pick(b.dataset.id); });
    hist.addEventListener('click', function (e) { var lg = e.target.closest('[data-logo]'); if (lg) { var p = lg.parentNode; opts.onLogo(lg.dataset.logo); p.textContent = opts.logoDone || 'Done: their logo on file is picked, so no setup is charged.'; return; } if (e.target.closest('.cf-x')) { hist.hidden = true; hist.innerHTML = ''; q.focus(); if (opts.onClear) opts.onClear(); } });
    return { search: function (t) { q.value = t; search(t); }, el: box };
  };
})();
