// /topnav.js
(function () {
  const ready = (fn) => (document.readyState !== 'loading'
    ? fn()
    : document.addEventListener('DOMContentLoaded', fn));

  const debounce = (fn, ms=100) => {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  function moveSearchNextToLogo() {
    const header = document.querySelector('header, .navbar, .top-nav, nav[role="navigation"]');
    if (!header) return;
    const logo = header.querySelector('a[aria-label="Logo"], .site-logo, .logo, a[href="/"]');
    const searchBtn = header.querySelector('.DocSearch-Button');
    if (logo && searchBtn && logo.nextSibling !== searchBtn) {
      logo.parentElement.insertBefore(searchBtn, logo.nextSibling);
      searchBtn.title = 'Search (Ctrl + K)';
      const ph = searchBtn.querySelector('.DocSearch-Button-Placeholder');
      if (ph) ph.style.display = 'none';
    }
  }

  function buildTopActions() {
    let cluster = document.querySelector('.eps-actions');
    if (!cluster) {
      cluster = document.createElement('div');
      cluster.className = 'eps-actions';
      document.body.appendChild(cluster);
    }

    // Copy page
    if (!cluster.querySelector('.eps-btn.copy')) {
      const btn = document.createElement('button');
      btn.className = 'eps-btn copy';
      btn.type = 'button';
      btn.textContent = 'Copy page';
      btn.addEventListener('click', async () => {
        const title = document.querySelector('h1')?.innerText?.trim() || document.title;
        const url = location.href;
        const sections = Array.from(document.querySelectorAll('h2'))
          .slice(0, 8).map(h => `- ${h.textContent.trim()}`).join('\n');
        const text = `${title}\n${url}${sections ? `\n\nSections:\n${sections}` : ''}`;
        try {
          await navigator.clipboard.writeText(text);
          btn.classList.add('done'); btn.textContent = 'Copied';
          setTimeout(() => { btn.classList.remove('done'); btn.textContent = 'Copy page'; }, 1300);
        } catch { alert('Copy failed—please copy from your address bar.'); }
      });
      cluster.appendChild(btn);
    }

    // Mode switch (clone if Mintlify provides one, else fallback)
    if (!cluster.querySelector('.eps-btn.theme')) {
      const existing = document.querySelector(
        'button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]'
      );
      if (existing) {
        const clone = existing.cloneNode(true);
        clone.classList.add('eps-btn', 'theme');
        cluster.appendChild(clone);
      } else {
        const btn = document.createElement('button');
        btn.className = 'eps-btn theme';
        btn.type = 'button';
        btn.textContent = 'Mode';
        const apply = (t) => document.documentElement.classList.toggle('dark', t === 'dark');
        const get = () => localStorage.getItem('theme') ||
          (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        apply(get());
        btn.addEventListener('click', () => {
          const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
          localStorage.setItem('theme', next); apply(next);
        });
        cluster.appendChild(btn);
      }
    }
  }

  function supportPill() {
    if (!document.querySelector('.eps-support')) {
      const a = document.createElement('a');
      a.className = 'eps-support';
      a.href = 'mailto:support@epsilo.io';  // change if you use a helpdesk URL
      a.textContent = 'Contact support';
      document.body.appendChild(a);
    }
  }

  function headerShadowOnScroll() {
    const header = document.querySelector('header, .navbar, .top-nav, nav[role="navigation"]');
    if (!header) return;
    const tick = () => (window.scrollY > 2 ? header.classList.add('eps-shadow')
                                           : header.classList.remove('eps-shadow'));
    tick(); window.addEventListener('scroll', tick, { passive: true });
  }

  function observeSpa() {
    const rerun = debounce(() => moveSearchNextToLogo(), 120);
    const mo = new MutationObserver(rerun);
    mo.observe(document.body, { childList: true, subtree: true });
  }

  ready(() => {
    moveSearchNextToLogo();
    buildTopActions();
    supportPill();
    headerShadowOnScroll();
    observeSpa();
  });
})();
