/* HD Laser Hub as a phone app (Hugh, Nov 2). Opened from the home screen icon there is no browser bar, so every page
   the hub opens in the app gets a small "Hub" button to come back, unless the page already shows its own way back
   (the order page's dark hub bar, the thank-you page's Back to the hub). Does nothing in a normal browser. */
(function () {
  var d = document, installed = false;
  try { installed = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; } catch (e) {}
  if (!installed) return;
  d.documentElement.classList.add('installed');
  if (/^\/hub\/?$/.test(location.pathname)) return;
  function add() {
    var own = [].some.call(d.querySelectorAll('a[href^="/hub"]'), function (a) { return a.offsetParent !== null && !a.closest('.app-hub'); });
    if (own || d.querySelector('.app-hub')) return;
    var a = d.createElement('a');
    a.href = '/hub/'; a.className = 'app-hub'; a.textContent = '‹ Hub'; a.setAttribute('aria-label', 'Back to the hub');
    a.style.cssText = 'position:fixed;left:calc(12px + env(safe-area-inset-left));bottom:calc(14px + env(safe-area-inset-bottom));z-index:9999;background:#15191E;color:#F2B63D;font:700 16px/1 Figtree,"Helvetica Neue",Arial,sans-serif;padding:13px 18px;border-radius:999px;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,.28)';
    d.body.appendChild(a);
    var s = d.createElement('style');
    s.textContent = 'html.installed body{padding-top:env(safe-area-inset-top);padding-bottom:calc(64px + env(safe-area-inset-bottom))}';
    d.head.appendChild(s);
  }
  // pages show or hide their own hub links after loading, so look again a moment later
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { setTimeout(add, 600); }); else setTimeout(add, 600);
})();
