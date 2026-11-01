// Christmas look for a page (Hugh, Nov 1: "yes add the christmas look with snow", after the Thanksgiving look, "we can
// go back to normal after holiday season"). From the day after Thanksgiving through December 31: snow falling, Christmas
// red, evergreen and gold, a "Merry Christmas!" headline, a live countdown to Christmas (from December 26 a countdown to
// the New Year), Christmas lights over the photo and a snowman that waves when tapped. January 1 the page is normal again
// by itself. ?theme=christmas previews it; ?theme=plain, ?theme=halloween or ?theme=thanksgiving leaves it off. Load it in
// the <head> so the colors are there before the page paints:
//   <script src="/assets/christmas.js?v=1" data-hello="#top h1" data-count="#top > div:first-child" data-deco="#top > div:nth-child(2)" data-link="/holiday/" data-link-text="See holiday gift ideas"></script>
// data-hello: the headline goes just before this element. data-count: the countdown card goes at the end of this one.
// data-deco: a positioned box that gets the lights and the snowman. data-link and data-link-text: the link in the card.
(function () {
  var q = (location.search.match(/[?&]theme=(\w+)/) || [])[1], now = new Date(), y = now.getFullYear();
  var fourthThu = function (yr) { var d = new Date(yr, 10, 1).getDay(); return new Date(yr, 10, 1 + (4 - d + 7) % 7 + 21); };
  var start = new Date(y, 10, fourthThu(y).getDate() + 1), end = new Date(y + 1, 0, 1);
  var inSeason = now >= start && now < end;
  if (!(q === 'christmas' || (!/^(plain|halloween|thanksgiving)$/.test(q || '') && inSeason))) return;
  var me = document.currentScript || {}, opt = me.dataset || {};
  // Before Christmas Day: count to Christmas. On the day: wish everyone a merry Christmas. After it: count to the New Year.
  var xmas = new Date(y, 11, 25), newYear = new Date(y + 1, 0, 1);
  document.documentElement.classList.add('christmas');
  var tc = document.querySelector('meta[name=theme-color]'); if (tc) tc.setAttribute('content', '#163A2A');
  var font = document.createElement('link'); font.rel = 'stylesheet'; font.href = 'https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@700&display=swap'; document.head.appendChild(font);

  // Pages styled inline (the home page) turn Christmas colors by matching those styles: the near-black sections go
  // evergreen and the blue labels go green; the red stays red. Pages with color variables (the holiday page) get new values.
  var swap = function (from, prop, to) { return 'html.christmas [style*="' + prop + ': ' + from + '"],html.christmas [style*="' + prop + ':' + from + '"]{' + prop + ':' + to + ' !important}'; };
  var css = [
    'html.christmas body{background:#F7F5F0 linear-gradient(180deg,rgba(214,228,240,.55),rgba(247,245,240,0) 520px) no-repeat;overflow-x:clip}',
    'html.christmas{--red:#B3261E;--redd:#8E1B14;--gold:#E3B341}',
    'html.christmas .more{background:linear-gradient(135deg,#1C4A34,#123024)}',
    swap('#15191E', 'background', '#163A2A'), swap('#232931', 'background', '#1F4A36'), swap('#2B5F8A', 'background', '#1F6B45'),
    swap('#2B5F8A', 'color', '#1F6B45'), swap('#C8372A', 'background', '#B3261E'), swap('#D5DADF', 'color', '#DCE8DF'),
    '.xm-hi{font-family:"Mountains of Christmas","Dancing Script","Brush Script MT",cursive;font-weight:700;font-size:58px;line-height:1;color:#B3261E;margin:0 0 10px;text-shadow:0 2px 0 rgba(227,179,65,.45)}',
    '.deadline + .xm-count{margin-top:22px}',
    '.xm-count{background:#fff;border:1px solid #DDE6DA;border-radius:20px;padding:16px 18px;box-shadow:0 8px 24px rgba(22,58,42,.12);max-width:520px;font-family:Figtree,"Helvetica Neue",Helvetica,sans-serif;color:#15191E;position:relative;overflow:hidden}',
    '.xm-count::before{content:"";position:absolute;left:0;right:0;top:0;height:6px;background:repeating-linear-gradient(135deg,#B3261E 0 12px,#fff 12px 24px,#1F6B45 24px 36px,#fff 36px 48px)}',
    '.xm-count .lbl{font-weight:800;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#1F6B45;margin:4px 0 10px;display:flex;align-items:center;gap:8px}',
    '.xm-count .lbl svg{width:22px;height:22px;flex:none}',
    '.xm-count .clock{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.xm-count .clock[hidden]{display:none}',
    '.xm-count .u{border-radius:14px;padding:10px 4px 8px;text-align:center;color:#fff;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}',
    '.xm-count .u:nth-child(odd){background:linear-gradient(180deg,#C8372A,#8E1B14)}.xm-count .u:nth-child(even){background:linear-gradient(180deg,#2A7A50,#163A2A)}',
    '.xm-count .u b{display:block;font-family:"Bricolage Grotesque","Trebuchet MS",sans-serif;font-size:34px;line-height:1;font-variant-numeric:tabular-nums}',
    '.xm-count .u span{display:block;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.92;margin-top:4px}',
    '.xm-count .note{margin:10px 0 0;color:#545B63;font-size:15px;line-height:1.5}.xm-count .note a{font-weight:700;color:#8E1B14;white-space:nowrap}',
    '.xm-snow{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:30}',
    '.xm-snow i{position:absolute;top:0;left:var(--x);width:var(--s);opacity:var(--o);animation:xm-fall var(--d) linear var(--w) infinite;will-change:transform}',
    '.xm-snow i svg{display:block;width:100%;height:auto;animation:xm-sway var(--sw) ease-in-out infinite alternate;filter:drop-shadow(0 0 1.5px rgba(60,95,135,.6))}',
    '.xm-lights{position:absolute;left:3%;top:4px;width:94%;height:auto;z-index:2;pointer-events:none}',
    '.xm-lights .bulb{animation:xm-twinkle 1.6s ease-in-out infinite alternate}',
    '.xm-snowman{position:absolute;right:14px;top:44px;width:96px;height:118px;border:0;background:none;padding:0;cursor:pointer;z-index:3;animation:xm-rock 3.2s ease-in-out infinite}',
    '.xm-snowman svg{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 6px 12px rgba(0,0,0,.3))}',
    '.xm-snowman .arm{transform-origin:66px 58px;animation:xm-wave 1.4s ease-in-out infinite alternate}',
    '.xm-snowman .say{position:absolute;right:88px;top:40px;background:#fff;color:#B3261E;font-family:"Mountains of Christmas","Dancing Script",cursive;font-weight:700;font-size:26px;line-height:1;padding:8px 14px;border-radius:16px 16px 4px 16px;box-shadow:0 4px 14px rgba(0,0,0,.2);opacity:0;transform:scale(.3);transform-origin:right top;transition:opacity .2s,transform .25s;white-space:nowrap;pointer-events:none}',
    '.xm-snowman.on .say{opacity:1;transform:scale(1)}.xm-snowman.on{animation:xm-jump .5s ease-out}',
    '.xm-pop{position:absolute;left:40px;top:20px;width:18px;pointer-events:none;animation:xm-pop 1.3s ease-out forwards}.xm-pop svg{display:block;width:100%;height:auto;filter:drop-shadow(0 0 2px rgba(60,95,135,.7))}',
    '@keyframes xm-fall{0%{transform:translateY(-40px)}100%{transform:translateY(calc(100vh + 60px))}}',
    '@keyframes xm-sway{from{transform:translateX(-18px) rotate(-40deg)}to{transform:translateX(18px) rotate(40deg)}}',
    '@keyframes xm-twinkle{from{opacity:.45}to{opacity:1}}',
    '@keyframes xm-rock{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}',
    '@keyframes xm-wave{from{transform:rotate(-12deg)}to{transform:rotate(18deg)}}',
    '@keyframes xm-jump{0%{transform:translateY(0) scale(1)}35%{transform:translateY(-20px) scale(1.06,.95)}70%{transform:translateY(0) scale(.97,1.04)}100%{transform:translateY(0) scale(1)}}',
    '@keyframes xm-pop{0%{transform:translate(0,0) scale(.3);opacity:1}100%{transform:translate(var(--x),-140px) scale(1.2);opacity:0}}',
    '@media (max-width:760px){.xm-hi{font-size:44px}.xm-count .u b{font-size:28px}.xm-snowman{top:40px;right:8px;width:76px;height:94px}.xm-snowman .say{right:68px;top:30px;font-size:22px}}',
    '@media (prefers-reduced-motion:reduce){.xm-snow{display:none}.xm-snowman,.xm-snowman .arm,.xm-lights .bulb{animation:none}}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var flake = '<symbol id="xm-flake" viewBox="0 0 40 40"><g stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none">' +
    '<path d="M20 2V38M4.4 11L35.6 29M4.4 29L35.6 11"/><path d="M20 8L16 4M20 8L24 4M20 32L16 36M20 32L24 36M9.6 14L4.8 15.6M9.6 14L8.4 9M30.4 26L35.2 24.4M30.4 26L31.6 31M9.6 26L8.4 31M9.6 26L4.8 24.4M30.4 14L31.6 9M30.4 14L35.2 15.6"/></g></symbol>' +
    '<symbol id="xm-dot" viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="#fff"/></symbol>';
  var SYMBOLS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' + flake + '</defs></svg>';
  var snowflakeIcon = '<svg viewBox="0 0 40 40" aria-hidden="true"><g stroke="#1F6B45" stroke-width="2.8" stroke-linecap="round" fill="none"><path d="M20 2V38M4.4 11L35.6 29M4.4 29L35.6 11"/><path d="M20 8L16 4M20 8L24 4M20 32L16 36M20 32L24 36"/></g></svg>';
  var lights = function () {
    var cols = ['#E53935', '#F6C343', '#2E9E5B', '#3D8BFD', '#E53935', '#F6C343', '#2E9E5B', '#3D8BFD', '#E53935', '#F6C343', '#2E9E5B'];
    var s = '<svg class="xm-lights" viewBox="0 0 400 44" aria-hidden="true"><path d="M0 4Q100 30 200 8Q300 30 400 4" fill="none" stroke="#1E3326" stroke-width="1.8"/>';
    for (var i = 0; i < 11; i++) {
      // two swags: the wire dips between 0 and 200 and again between 200 and 400
      var t = (i + 0.5) / 11, x = 400 * t, h = t < 0.5 ? t * 2 : (t - 0.5) * 2, a = t < 0.5 ? 4 : 8, c = t < 0.5 ? 8 : 4, yy = a * (1 - h) * (1 - h) + 60 * (1 - h) * h + c * h * h;
      s += '<rect x="' + (x - 2.5).toFixed(1) + '" y="' + (yy - 1).toFixed(1) + '" width="5" height="5" rx="1" fill="#5A6B60"/>' +
        '<ellipse class="bulb" cx="' + x.toFixed(1) + '" cy="' + (yy + 10).toFixed(1) + '" rx="5" ry="8" fill="' + cols[i] + '" style="animation-delay:' + ((i % 4) * 0.4).toFixed(1) + 's;filter:drop-shadow(0 0 4px ' + cols[i] + ')"/>';
    }
    return s + '</svg>';
  };
  var snowman = '<span class="say">Merry Christmas!</span><svg viewBox="0 0 100 124" aria-hidden="true">' +
    '<path d="M34 58L12 44M17 47L10 40M17 47L9 50" stroke="#6A4326" stroke-width="3" stroke-linecap="round" fill="none"/>' +
    '<g class="arm"><path d="M66 58L88 40M83 44L90 36M83 44L92 45" stroke="#6A4326" stroke-width="3" stroke-linecap="round" fill="none"/></g>' +
    '<circle cx="50" cy="96" r="26" fill="#fff" stroke="#C9D8E6" stroke-width="2"/><circle cx="50" cy="60" r="19" fill="#fff" stroke="#C9D8E6" stroke-width="2"/>' +
    '<circle cx="50" cy="56" r="2.6" fill="#22303C"/><circle cx="50" cy="66" r="2.6" fill="#22303C"/><circle cx="50" cy="88" r="2.8" fill="#22303C"/><circle cx="50" cy="100" r="2.8" fill="#22303C"/>' +
    '<circle cx="50" cy="30" r="15" fill="#fff" stroke="#C9D8E6" stroke-width="2"/>' +
    '<path d="M34 40Q50 48 66 40L66 46Q50 54 34 46Z" fill="#B3261E"/><path d="M58 46L64 62L56 63L53 48Z" fill="#B3261E"/><path d="M60 52L62 57M57 51L59 56" stroke="#fff" stroke-width="1.5"/>' +
    '<rect x="36" y="2" width="28" height="18" rx="2" fill="#1E2A24"/><rect x="30" y="17" width="40" height="5" rx="2" fill="#1E2A24"/><rect x="36" y="13" width="28" height="4" fill="#2A7A50"/>' +
    '<circle cx="44" cy="27" r="2.3" fill="#22303C"/><circle cx="56" cy="27" r="2.3" fill="#22303C"/><path d="M50 31L62 34L50 35Z" fill="#F08A2C"/>' +
    '<path d="M44 37Q50 41 56 37" stroke="#22303C" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>';
  var piece = function (dot) { return '<svg viewBox="0 0 40 40"><use href="#' + (dot ? 'xm-dot' : 'xm-flake') + '"/></svg>'; };

  function build() {
    var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, $ = function (s) { return s ? document.querySelector(s) : null; };
    document.body.insertAdjacentHTML('afterbegin', SYMBOLS + '<div class="xm-snow" id="xmsnow" aria-hidden="true"></div>');
    var now2 = new Date(), after = now2 >= new Date(xmas.getFullYear(), 11, 26);
    var hello = $(opt.hello); if (hello) hello.insertAdjacentHTML('beforebegin', '<p class="xm-hi">' + (after ? 'Happy Holidays!' : 'Merry Christmas!') + '</p>');
    var spot = $(opt.count);
    if (spot) {
      var link = opt.link ? ' <a href="' + opt.link.replace(/"/g, '') + '">' + (opt.linkText || 'See holiday gift ideas').replace(/[<>]/g, '') + ' &rarr;</a>' : '';
      spot.insertAdjacentHTML('beforeend', '<div class="xm-count" id="xmcount"><p class="lbl">' + snowflakeIcon + '<span>Christmas is in</span></p>' +
        '<div class="clock" role="timer" aria-label="Time until Christmas"><div class="u"><b>--</b><span>days</span></div><div class="u"><b>--</b><span>hours</span></div><div class="u"><b>--</b><span>minutes</span></div><div class="u"><b>--</b><span>seconds</span></div></div>' +
        '<p class="note">A gift with a name or your logo on it, made here in Pacific Beach.' + link + '</p></div>');
      var box = document.getElementById('xmcount'), b = box.querySelectorAll('.u b'), lbl = box.querySelector('.lbl span'), clock = box.querySelector('.clock'), pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var tick = function () {
        var n = new Date(), day = n.getFullYear() === xmas.getFullYear() && n.getMonth() === 11 && n.getDate() === 25, target = n < xmas ? xmas : newYear;
        if (day) { lbl.textContent = 'Merry Christmas'; clock.hidden = true; box.querySelector('.note').textContent = 'Merry Christmas from all of us at HD Laser Studio. Thank you for a wonderful year, San Diego.'; return; }
        clock.hidden = false; lbl.textContent = target === xmas ? 'Christmas is in' : 'The New Year is in'; clock.setAttribute('aria-label', target === xmas ? 'Time until Christmas' : 'Time until the New Year');
        var s = Math.max(0, Math.floor((target - n) / 1000));
        b[0].textContent = Math.floor(s / 86400); b[1].textContent = pad(Math.floor(s % 86400 / 3600)); b[2].textContent = pad(Math.floor(s % 3600 / 60)); b[3].textContent = pad(s % 60);
      };
      tick(); setInterval(tick, 1000);
    }
    var deco = $(opt.deco);
    if (deco) {
      deco.insertAdjacentHTML('beforeend', lights() + '<button type="button" class="xm-snowman" id="xmsnowman" aria-label="Merry Christmas! Tap the snowman">' + snowman + '</button>');
      var sm = document.getElementById('xmsnowman');
      sm.addEventListener('click', function () {
        sm.classList.remove('on'); void sm.offsetWidth; sm.classList.add('on'); clearTimeout(sm.t); sm.t = setTimeout(function () { sm.classList.remove('on'); }, 1700);
        if (still) return;
        [-70, -30, 0, 30, 70].forEach(function (x, i) { var p = document.createElement('span'); p.className = 'xm-pop'; p.style.setProperty('--x', x + 'px'); p.style.animationDelay = (i * 0.06) + 's'; p.innerHTML = piece(i % 2); sm.appendChild(p); setTimeout(function () { p.remove(); }, 1600); });
      });
    }
    if (!still) {
      var n = window.innerWidth < 640 ? 24 : 46, r = Math.random, html = '';
      for (var i = 0; i < n; i++) { var dot = i % 3 === 0, d = 8 + r() * 10;
        html += '<i style="--x:' + (r() * 100).toFixed(1) + 'vw;--s:' + Math.round(dot ? 5 + r() * 6 : 10 + r() * 14) + 'px;--o:' + (0.65 + r() * 0.35).toFixed(2) + ';--d:' + d.toFixed(1) + 's;--w:' + (-r() * d).toFixed(1) + 's;--sw:' + (2.5 + r() * 2.5).toFixed(1) + 's">' + piece(dot) + '</i>'; }
      document.getElementById('xmsnow').innerHTML = html;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
