// /topnav.js
(function () {
  const onReady = (fn) =>
    (document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn));

  function moveSearchNextToLogo() {
    const header = document.querySelector('header, .navbar, .top-nav, nav[role="navigation"]');
    if (!header) return;

    const logo =
      header.querySelector('a[aria-label="Logo"]') ||
      header.querySelector('.site-logo, .logo, a[href="/"]');
    const searchBtn = header.querySelector('.DocSearch-Button');

    if (logo && searchBtn) {
      // make search compact + place just after logo
      if (logo.nextSibling !== searchBtn) {
        logo.parentElement.insertBefore(searchBtn, logo.nextSibling);
      }
      searchBtn.setAttribute('aria-label', 'Search');
      // icon-only (text hidden via CSS too)
      const ph = searchBtn.querySelector('.DocSearch-Button-Placeholder');
      if (ph) ph.style.display = 'none';
    }
  }

  function buildTopRightActions() {
    // a fixed cluster at the very top-right like Linear (Copy page + theme toggle)
    let cluster = document.querySelector('.eps-actions');
    if (!cluster) {
      cluster = document.createElement('div');
      cluster.className = 'eps-actions';
      document.body.appendChild(cluster);
    }

    // Copy page button
    let copyBtn = cluster.querySelector('.eps-btn.copy');
    if (!copyBtn) {
      copyBtn = document.createElement('button');
      copyBtn.className = 'eps-btn copy';
      copyBtn.type = 'button';
      copyBtn.textContent = 'Copy page';
      copyBtn.addEventListener('click', async () => {
        const title = document.querySelector('h1')?.innerText?.trim() || document.title;
        const url = location.href;
        const h2s = Array.from(document.querySelectorAll('h2')).slice(0, 8)
          .map(h => `- ${h.textContent.trim()}`).join('\n');
        const text = `${title}\n${url}${h2s ? `\n\nSections:\n${h2s}` : ''}`;
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.classList.add('done');
          copyBtn.textContent = 'Copied';
          setTimeout(() => { copyBtn.classList.remove('done'); copyBtn.textContent = 'Copy page'; }, 1400);
        } catch {
          alert('Copy failed—please copy from the address bar.');
        }
      });
      cluster.appendChild(copyBtn);
    }

    // Theme toggle: reuse Mintlify's if available; else provide a minimal fallback
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

  function addContactSupport() {
    // bottom-left persistent contact pill
    if (!document.querySelector('.eps-support')) {
      const a = document.createElement('a');
      a.className = 'eps-support';
      a.href = 'mailto:support@epsilo.io'; // change if you use a help portal
      a.textContent = 'Contact support';
      document.body.appendChild(a);
    }
  }

  function headerScrollShadow() {
    const header = document.querySelector('header, .navbar, .top-nav, nav[role="navigation"]');
    if (!header) return;
    const handler = () => {
      if (window.scrollY > 2) header.classList.add('eps-shadow');
      else header.classList.remove('eps-shadow');
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
  }

  function observeSpaChanges() {
    // Mintlify is SPA-like; watch for route/content changes and re-run placement
    const mo = new MutationObserver(() => {
      moveSearchNextToLogo();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  onReady(() => {
    moveSearchNextToLogo();
    buildTopRightActions();
    addContactSupport();
    headerScrollShadow();
    observeSpaChanges();
  });
})();
