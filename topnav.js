// /topnav.js
(function () {
  const ready = (fn) =>
    (document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn));

  function ensureOnce(selector, create) {
    let el = document.querySelector(selector);
    if (!el) el = create();
    return el;
  }

  function moveSearchNextToLogo() {
    const searchBtn = document.querySelector('.DocSearch-Button');
    const logo =
      document.querySelector('header a[aria-label="Logo"]') ||
      document.querySelector('header .site-logo, header .logo') ||
      document.querySelector('header a[href="/"]');
    if (searchBtn && logo && logo.parentElement) {
      // Insert search right after the logo
      if (searchBtn.previousElementSibling !== logo) {
        logo.parentElement.insertBefore(searchBtn, logo.nextSibling);
      }
    }
  }

  function initTopActions() {
    const actions = ensureOnce('.eps-actions', () => {
      const div = document.createElement('div');
      div.className = 'eps-actions';
      document.body.appendChild(div);
      return div;
    });

    // ---- Copy page button ----
    let copyBtn = actions.querySelector('.eps-btn.copy');
    if (!copyBtn) {
      copyBtn = document.createElement('button');
      copyBtn.className = 'eps-btn copy';
      copyBtn.textContent = 'Copy page';
      copyBtn.addEventListener('click', async () => {
        const title = document.querySelector('h1')?.innerText?.trim() || document.title;
        const url = window.location.href;
        const sections = Array.from(document.querySelectorAll('h2'))
          .slice(0, 6).map(h => `- ${h.textContent.trim()}`).join('\n');
        const text = `${title}\n${url}${sections ? `\n\nSections:\n${sections}` : ''}`;
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.classList.add('done');
          copyBtn.textContent = 'Copied';
          setTimeout(() => { copyBtn.classList.remove('done'); copyBtn.textContent = 'Copy page'; }, 1600);
        } catch {
          alert('Copy failed. Please copy from the address bar.');
        }
      });
      actions.appendChild(copyBtn);
    }

    // ---- Mode switch (reuse if Mintlify already injects one) ----
    let toggle = actions.querySelector('.eps-btn.theme');
    if (!toggle) {
      // Try to clone an existing theme toggle if present
      const existingToggle = document.querySelector(
        'button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]'
      );
      if (existingToggle) {
        toggle = existingToggle.cloneNode(true);
        toggle.classList.add('eps-btn', 'theme');
      } else {
        // Fallback: a lightweight toggle that sets html.dark and persists it
        toggle = document.createElement('button');
        toggle.className = 'eps-btn theme';
        toggle.textContent = 'Mode';
        const applyTheme = (val) => {
          document.documentElement.classList.toggle('dark', val === 'dark');
        };
        const getPref = () =>
          localStorage.getItem('theme') ||
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        applyTheme(getPref());
        toggle.addEventListener('click', () => {
          const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
          localStorage.setItem('theme', next);
          applyTheme(next);
        });
      }
      actions.appendChild(toggle);
    }
  }

  function initSupportPill() {
    ensureOnce('.eps-support', () => {
      const a = document.createElement('a');
      a.className = 'eps-support';
      a.href = 'mailto:support@epsilo.io'; // update if you prefer a link/form
      a.textContent = 'Contact support';
      document.body.appendChild(a);
      return a;
    });
  }

  // Handle SPA navigation: watch for content swaps and re-run placement
  function observeRouteChanges() {
    const obs = new MutationObserver(() => {
      moveSearchNextToLogo();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  ready(() => {
    moveSearchNextToLogo();
    initTopActions();
    initSupportPill();
    observeRouteChanges();
  });
})();
