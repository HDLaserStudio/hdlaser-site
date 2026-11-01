// Thanksgiving look for a page (Hugh, Nov 1: the holiday page first, then "change the whole hdlaser.net page to this ...
// we can go back to normal after holiday season"). From November 1 through Thanksgiving Day: warm autumn colors, a
// "Happy Thanksgiving!" headline, a live countdown, leaves, acorns and little pumpkins falling, and a turkey that gobbles
// when tapped. The day after Thanksgiving the page is back to normal by itself. ?theme=thanksgiving previews it,
// ?theme=holiday hides it. Load it in the <head> so the colors are there before the page paints:
//   <script src="/assets/thanksgiving.js?v=1" data-hello="#top h1" data-count="#top > div:first-child" data-turkey="#top > div:nth-child(2)"></script>
// data-hello: the headline goes just before this element. data-count: the countdown card goes at the end of this one.
// data-turkey: a positioned box that gets the leaf garland and the turkey. (The holiday page has its own copy of this look.)
(function () {
  var q = (location.search.match(/[?&]theme=(\w+)/) || [])[1], now = new Date(), y = now.getFullYear();
  var fourthThu = function (yr) { var d = new Date(yr, 10, 1).getDay(); return new Date(yr, 10, 1 + (4 - d + 7) % 7 + 21); };
  var tday = fourthThu(y), dayAfter = new Date(y, 10, tday.getDate() + 1);
  if (!(q === 'thanksgiving' || (q !== 'holiday' && now.getMonth() === 10 && now < dayAfter))) return;
  var T = now >= dayAfter ? fourthThu(y + 1) : tday, me = document.currentScript || {}, opt = me.dataset || {};
  document.documentElement.classList.add('thanksgiving');
  var tc = document.querySelector('meta[name=theme-color]'); if (tc) tc.setAttribute('content', '#7A3B12');
  var font = document.createElement('link'); font.rel = 'stylesheet'; font.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap'; document.head.appendChild(font);

  // The home page is styled inline, so its colors turn autumn by matching those styles: red buttons go burnt orange,
  // the near-black sections go deep brown, the blue labels go rust, the cream background goes warmer.
  var swap = function (from, prop, to) { return 'html.thanksgiving [style*="' + prop + ': ' + from + '"],html.thanksgiving [style*="' + prop + ':' + from + '"]{' + prop + ':' + to + ' !important}'; };
  var css = [
    'html.thanksgiving body{background:#FBF3E6 radial-gradient(ellipse at 12% 0%,rgba(224,162,59,.22),transparent 55%) no-repeat;overflow-x:clip}',
    'html.thanksgiving a{color:#9E3D12}',
    swap('#C8372A', 'background', '#C4561D'), swap('#E0483A', 'background', '#D06A2A'), swap('#15191E', 'background', '#3A2414'),
    swap('#232931', 'background', '#4A2E1A'), swap('#2B5F8A', 'background', '#9E3D12'), swap('#F6F4EF', 'background', '#FBF3E6'),
    swap('#EDE8DF', 'background', '#F5E6CF'), swap('#C8372A', 'color', '#C4561D'), swap('#A32C21', 'color', '#9E3D12'),
    swap('#15191E', 'color', '#3A2414'), swap('#545B63', 'color', '#6E5643'), swap('#2B5F8A', 'color', '#9E3D12'), swap('#D5DADF', 'color', '#EBDCC8'),
    '.tg-hi{font-family:"Dancing Script","Brush Script MT","Snell Roundhand",cursive;font-weight:700;font-size:56px;line-height:1;color:#C4561D;margin:0;text-shadow:0 2px 0 rgba(224,162,59,.35)}',
    '.tg-count{background:#fff;border:1px solid #EAD9C2;border-radius:20px;padding:16px 18px;box-shadow:0 8px 24px rgba(122,59,18,.10);max-width:520px;font-family:Figtree,"Helvetica Neue",Helvetica,sans-serif;color:#3A2414}',
    '.tg-count .lbl{font-weight:800;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#9E3D12;margin:0 0 10px;display:flex;align-items:center;gap:8px}',
    '.tg-count .lbl svg{width:22px;height:22px;color:#C4561D;flex:none}',
    '.tg-count .clock{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.tg-count .clock[hidden]{display:none}',
    '.tg-count .u{background:linear-gradient(180deg,#D06A2A,#9E3D12);color:#fff;border-radius:14px;padding:10px 4px 8px;text-align:center;box-shadow:inset 0 -3px 0 rgba(0,0,0,.15)}',
    '.tg-count .u b{display:block;font-family:"Bricolage Grotesque","Trebuchet MS",sans-serif;font-size:34px;line-height:1;font-variant-numeric:tabular-nums}',
    '.tg-count .u span{display:block;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.92;margin-top:4px}',
    '.tg-count .note{margin:10px 0 0;color:#6E5643;font-size:15px;line-height:1.5}.tg-count .note a{font-weight:700;color:#9E3D12;white-space:nowrap}',
    '.tg-fall{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:30}',
    '.tg-fall i{position:absolute;top:0;left:var(--x);width:var(--s);animation:tg-fall var(--d) linear var(--w) infinite;will-change:transform}',
    '.tg-fall i svg{display:block;width:100%;height:auto;animation:tg-sway var(--sw) ease-in-out infinite alternate;filter:drop-shadow(0 2px 2px rgba(58,36,20,.2))}',
    '.tg-garland{position:absolute;left:4%;top:6px;width:92%;height:auto;z-index:2;pointer-events:none}',
    '.tg-turkey{position:absolute;right:16px;top:46px;width:122px;height:112px;border:0;background:none;padding:0;cursor:pointer;z-index:3;animation:tg-strut 2.8s ease-in-out infinite}',
    '.tg-turkey svg{display:block;width:100%;height:100%;filter:drop-shadow(0 6px 14px rgba(0,0,0,.35))}',
    '.tg-turkey .say{position:absolute;right:100px;top:58px;background:#fff;color:#9E3D12;font-family:"Dancing Script","Brush Script MT",cursive;font-weight:700;font-size:28px;line-height:1;padding:8px 14px;border-radius:16px 16px 4px 16px;box-shadow:0 4px 14px rgba(0,0,0,.2);opacity:0;transform:scale(.3);transform-origin:right top;transition:opacity .2s,transform .25s;white-space:nowrap;pointer-events:none}',
    '.tg-turkey.on .say{opacity:1;transform:scale(1)}.tg-turkey.on{animation:tg-jump .5s ease-out}',
    '.tg-pop{position:absolute;left:46px;top:34px;width:26px;pointer-events:none;animation:tg-pop 1.3s ease-out forwards}.tg-pop svg{display:block;width:100%;height:auto}',
    '@keyframes tg-fall{0%{transform:translateY(-70px) rotate(0deg)}100%{transform:translateY(calc(100vh + 90px)) rotate(var(--r))}}',
    '@keyframes tg-sway{from{transform:translateX(-28px) rotate(-20deg)}to{transform:translateX(28px) rotate(20deg)}}',
    '@keyframes tg-strut{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg) translateY(-2px)}}',
    '@keyframes tg-jump{0%{transform:translateY(0) scale(1)}35%{transform:translateY(-22px) scale(1.08,.94)}70%{transform:translateY(0) scale(.96,1.05)}100%{transform:translateY(0) scale(1)}}',
    '@keyframes tg-pop{0%{transform:translate(0,0) scale(.3);opacity:1}100%{transform:translate(var(--x),-150px) scale(1);opacity:0}}',
    '@media (max-width:760px){.tg-hi{font-size:42px}.tg-count .u b{font-size:28px}.tg-turkey{top:42px;right:10px;width:92px;height:84px}.tg-turkey .say{right:72px;top:44px;font-size:24px}}',
    '@media (prefers-reduced-motion:reduce){.tg-fall{display:none}.tg-turkey{animation:none}}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var maple = 'M50 4L58 22L68 16L64 38L80 30L76 42L92 44L80 56L86 60L66 66L68 76L54 70L52 96L48 96L46 70L32 76L34 66L14 60L20 56L8 44L24 42L20 30L36 38L32 16L42 22Z';
  var oak = 'M50 6C60 10 56 20 64 22C74 24 70 34 78 38C86 42 78 52 84 58C90 66 78 70 72 74C66 80 58 78 54 86L52 96L48 96L46 86C42 78 34 80 28 74C22 70 10 66 16 58C22 52 14 42 22 38C30 34 26 24 36 22C44 20 40 10 50 6Z';
  var SYMBOLS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    '<symbol id="tg-maple" viewBox="0 0 100 100"><path d="' + maple + '" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M50 94V30M50 62L28 46M50 62L72 46M50 46L38 28M50 46L62 28" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="2.4" stroke-linecap="round"/></symbol>' +
    '<symbol id="tg-oak" viewBox="0 0 100 100"><path d="' + oak + '" fill="currentColor"/><path d="M50 94V16M50 40L34 30M50 40L66 30M50 58L30 50M50 58L70 50M50 74L36 70M50 74L64 70" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="2.2" stroke-linecap="round"/></symbol>' +
    '<symbol id="tg-acorn" viewBox="0 0 60 80"><ellipse cx="30" cy="52" rx="17" ry="22" fill="#C98F52"/><ellipse cx="24" cy="48" rx="5" ry="10" fill="#E2B27A" opacity=".6"/><path d="M7 38Q30 12 53 38Q30 46 7 38Z" fill="#6A3F18"/><path d="M14 33Q30 22 46 33" fill="none" stroke="#8A5A2A" stroke-width="2"/><rect x="28" y="8" width="4.5" height="14" rx="2" fill="#5A3412"/></symbol>' +
    '<symbol id="tg-pumpkin" viewBox="0 0 100 90"><path d="M47 20C46 12 48 6 55 3L58 7C53 9 53 14 54 20Z" fill="#4B6B2A"/><ellipse cx="31" cy="53" rx="23" ry="32" fill="#D96A1A"/><ellipse cx="69" cy="53" rx="23" ry="32" fill="#D96A1A"/><ellipse cx="50" cy="53" rx="25" ry="34" fill="#F08A2C"/><ellipse cx="42" cy="40" rx="6" ry="14" fill="#FFB067" opacity=".55"/></symbol>' +
    '</defs></svg>';
  var kinds = [['tg-maple', '#C4561D'], ['tg-maple', '#E0A23B'], ['tg-maple', '#9E2B25'], ['tg-oak', '#D9782D'], ['tg-oak', '#7A4A1E'], ['tg-maple', '#D9782D'], ['tg-acorn'], ['tg-pumpkin']];
  var piece = function (k) { var vb = k[0] === 'tg-acorn' ? '0 0 60 80' : k[0] === 'tg-pumpkin' ? '0 0 100 90' : '0 0 100 100'; return '<svg viewBox="' + vb + '"' + (k[1] ? ' style="color:' + k[1] + '"' : '') + '><use href="#' + k[0] + '"/></svg>'; };
  var turkey = function () {
    var f = '', a = [-78, -52, -26, 0, 26, 52, 78], c = ['#9E2B25', '#E0A23B', '#C4561D', '#9E2B25', '#C4561D', '#E0A23B', '#9E2B25'], a2 = [-65, -39, -13, 13, 39, 65], c2 = ['#F0C060', '#D06A2A', '#F0C060', '#D06A2A', '#F0C060', '#D06A2A'], i;
    for (i = 0; i < a.length; i++) f += '<ellipse cx="60" cy="26" rx="11" ry="28" fill="' + c[i] + '" transform="rotate(' + a[i] + ' 60 64)"/>';
    for (i = 0; i < a2.length; i++) f += '<ellipse cx="60" cy="38" rx="7.5" ry="20" fill="' + c2[i] + '" transform="rotate(' + a2[i] + ' 60 64)"/>';
    return '<span class="say">Gobble gobble!</span><svg viewBox="0 0 120 112" aria-hidden="true">' + f +
      '<path d="M50 96L47 106M47 106L41 108M47 106L49 110M70 96L73 106M73 106L79 108M73 106L71 110" stroke="#E0A23B" stroke-width="3" stroke-linecap="round" fill="none"/>' +
      '<ellipse cx="60" cy="76" rx="27" ry="25" fill="#7A4A1E"/><ellipse cx="39" cy="78" rx="9" ry="15" fill="#6A3F18" transform="rotate(18 39 78)"/><ellipse cx="81" cy="78" rx="9" ry="15" fill="#6A3F18" transform="rotate(-18 81 78)"/>' +
      '<ellipse cx="60" cy="82" rx="15" ry="14" fill="#8F5A2A"/><circle cx="60" cy="49" r="14" fill="#8F5A2A"/><circle cx="54.5" cy="46" r="3" fill="#1E120A"/><circle cx="65.5" cy="46" r="3" fill="#1E120A"/>' +
      '<circle cx="55.4" cy="45" r="1" fill="#fff"/><circle cx="66.4" cy="45" r="1" fill="#fff"/><path d="M56.5 52L63.5 52L60 58Z" fill="#E0A23B"/><path d="M61.5 55C67 57 67 66 62 68C58.5 64 58.5 59 61.5 55Z" fill="#C62828"/></svg>';
  };
  var garland = function () {
    var cols = ['#C4561D', '#E0A23B', '#9E2B25', '#D9782D', '#7A4A1E', '#E0A23B', '#C4561D', '#9E2B25', '#D9782D'], s = '<svg class="tg-garland" viewBox="0 0 400 54" aria-hidden="true"><path d="M0 6Q200 40 400 6" fill="none" stroke="#7A4A1E" stroke-width="1.6"/>';
    for (var i = 1; i < 10; i++) { var t = i / 10, x = 400 * t, yy = 6 * (1 - t) * (1 - t) + 80 * (1 - t) * t + 6 * t * t;
      s += '<use href="#' + (i % 2 ? 'tg-maple' : 'tg-oak') + '" x="' + (x - 13).toFixed(1) + '" y="' + (yy - 2).toFixed(1) + '" width="26" height="26" style="color:' + cols[i - 1] + '" transform="rotate(' + (i % 2 ? 14 : -14) + ' ' + x.toFixed(1) + ' ' + (yy + 11).toFixed(1) + ')"/>'; }
    return s + '</svg>';
  };

  function build() {
    var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, $ = function (s) { return s ? document.querySelector(s) : null; };
    document.body.insertAdjacentHTML('afterbegin', SYMBOLS + '<div class="tg-fall" id="tgfall" aria-hidden="true"></div>');
    var hello = $(opt.hello); if (hello) hello.insertAdjacentHTML('beforebegin', '<p class="tg-hi">Happy Thanksgiving!</p>');
    var spot = $(opt.count), box;
    if (spot) {
      spot.insertAdjacentHTML('beforeend', '<div class="tg-count" id="tgcount"><p class="lbl"><svg viewBox="0 0 100 100" aria-hidden="true"><use href="#tg-maple"/></svg><span>Thanksgiving is in</span></p>' +
        '<div class="clock" role="timer" aria-label="Time until Thanksgiving"><div class="u"><b>--</b><span>days</span></div><div class="u"><b>--</b><span>hours</span></div><div class="u"><b>--</b><span>minutes</span></div><div class="u"><b>--</b><span>seconds</span></div></div>' +
        '<p class="note">Thank your host, your team and your clients with a gift that has their name or your logo on it. <a href="/holiday/">See Thanksgiving gift ideas &rarr;</a></p></div>');
      box = document.getElementById('tgcount');
      var b = box.querySelectorAll('.u b'), pad = function (n) { return (n < 10 ? '0' : '') + n; }, iv;
      var tick = function () {
        var ms = T - new Date();
        if (ms <= 0) { box.querySelector('.lbl span').textContent = 'Today is Thanksgiving'; box.querySelector('.clock').hidden = true;
          box.querySelector('.note').innerHTML = 'Happy Thanksgiving from all of us at HD Laser Studio. Thank you for a wonderful year, San Diego.'; clearInterval(iv); return; }
        var s = Math.floor(ms / 1000);
        b[0].textContent = Math.floor(s / 86400); b[1].textContent = pad(Math.floor(s % 86400 / 3600)); b[2].textContent = pad(Math.floor(s % 3600 / 60)); b[3].textContent = pad(s % 60);
      };
      tick(); iv = setInterval(tick, 1000);
    }
    var tbox = $(opt.turkey);
    if (tbox) {
      tbox.insertAdjacentHTML('beforeend', garland() + '<button type="button" class="tg-turkey" id="tgturkey" aria-label="Gobble gobble! Tap the turkey">' + turkey() + '</button>');
      var tk = document.getElementById('tgturkey');
      tk.addEventListener('click', function () {
        tk.classList.remove('on'); void tk.offsetWidth; tk.classList.add('on'); clearTimeout(tk.t); tk.t = setTimeout(function () { tk.classList.remove('on'); }, 1600);
        if (still) return;
        [-80, -26, 26, 80].forEach(function (x, i) { var p = document.createElement('span'); p.className = 'tg-pop'; p.style.setProperty('--x', x + 'px'); p.style.animationDelay = (i * 0.07) + 's'; p.innerHTML = piece(kinds[i]); tk.appendChild(p); setTimeout(function () { p.remove(); }, 1600); });
      });
    }
    if (!still) {
      var n = window.innerWidth < 640 ? 12 : 22, r = Math.random, html = '';
      for (var i = 0; i < n; i++) { var k = kinds[i % kinds.length], big = k[0] === 'tg-pumpkin' ? 1.25 : k[0] === 'tg-acorn' ? 0.7 : 1, d = 10 + r() * 10;
        html += '<i style="--x:' + (r() * 100).toFixed(1) + 'vw;--s:' + Math.round((20 + r() * 20) * big) + 'px;--d:' + d.toFixed(1) + 's;--w:' + (-r() * d).toFixed(1) + 's;--sw:' + (2 + r() * 2).toFixed(1) + 's;--r:' + Math.round(180 + r() * 360) * (r() < 0.5 ? -1 : 1) + 'deg">' + piece(k) + '</i>'; }
      document.getElementById('tgfall').innerHTML = html;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
