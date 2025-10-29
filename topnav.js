// topnav.js
(function () {
  const ready = (fn) =>
    (document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn));

  // Insert Copy button into navbar next to the primary "Sign in" button
  function injectNavbarActions() {
    // Common navbar roots Mintlify uses
    const header = document.querySelector('header, .navbar, .top-nav, nav[role="navigation"]');
    if (!header) return;

    // Find the primary CTA (your Sign in)
    const primary =
      header.querySelector('.primary a, .primary button, nav .primary a, nav .primary button') ||
      header.querySelector('a[href^="https://one.epsilo.io"], a[href="/login"], a[href*="sign"]');

    // If we can't find the CTA, bail (prevents duplicates)
    if (!primary || primary.closest('.eps-nav-actions')) return;

    // Wrap CTA + Copy in a small cluster
    const cluster = document.createElement('div');
    cluster.className = 'eps-nav-actions';

    // COPY button (outlined)
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'eps-btn eps-btn-outline copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', async () => {
      const title = document.querySelector('h1')?.innerText?.trim() || document.title;
      const url = location.href;
      const sections = Array.from(document.querySelectorAll('h2'))
        .slice(0, 8).map(h => `- ${h.textContent.trim()}`).join('\n');
      const text = `${title}\n${url}${sections ? `\n\nSections:\n${sections}` : ''}`;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.classList.add('done');
        copyBtn.textContent = 'Copied';
        setTimeout(() => { copyBtn.classList.remove('done'); copyBtn.textContent = 'Copy'; }, 1200);
      } catch {
        alert('Copy failed — please copy from the address bar.');
      }
    });

    // Insert: [Copy] right before the primary CTA
    const primaryContainer = primary.parentElement;
    primaryContainer.parentElement.insertBefore(cluster, primaryContainer);
    cluster.appendChild(copyBtn);
    cluster.appendChild(primaryContainer);

    // Remove any old floating cluster if it exists
    document.querySelectorAll('.eps-actions').forEach(el => el.remove());
  }

  // Bottom-left “Get support” pill (keeps your existing behavior)
  function ensureSupportPill() {
    if (!document.querySelector('.eps-support')) {
      const a = document.createElement('a');
      a.className = 'eps-support';
      a.href = 'mailto:support@epsilo.io';
      a.textContent = 'Get support';
      document.body.appendChild(a);
    }
  }

  // Keep search button right after the logo (optional; harmless if already ok)
  function moveSearchNextToLogo() {
    const header = document.querySelector('header, .navbar, .top-nav, nav[role="navigation"]');
    if (!header) return;
    const logo = header.querySelector('a[aria-label="Logo"], .site-logo, .logo, a[href="/"]');
    const searchBtn = header.querySelector('.DocSearch-Button');
    if (logo && searchBtn && logo.nextSibling !== searchBtn) {
      logo.parentElement.insertBefore(searchBtn, logo.nextSibling);
    }
  }

  // Handle SPA route changes
  function observeSPA() {
    const mo = new MutationObserver(() => {
      injectNavbarActions();
      moveSearchNextToLogo();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  ready(() => {
    injectNavbarActions();
    ensureSupportPill();
    moveSearchNextToLogo();
    observeSPA();
  });
})();
