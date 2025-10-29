// topnav.js
(function () {
  const ready = (fn) =>
    (document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn));

  function injectNavbarActions() {
    const header = document.querySelector('header, .navbar, .top-nav, nav[role="navigation"]');
    if (!header) return;

    const primary =
      header.querySelector('.primary a, .primary button, nav .primary a, nav .primary button') ||
      header.querySelector('a[href^="https://one.epsilo.io"], a[href="/login"], a[href*="sign"]');

    if (!primary || primary.closest('.eps-nav-actions')) return;

    const cluster = document.createElement('div');
    cluster.className = 'eps-nav-actions';

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

    const primaryContainer = primary.parentElement;
    primaryContainer.parentElement.insertBefore(cluster, primaryContainer);
    cluster.appendChild(copyBtn);
    cluster.appendChild(primaryContainer);

    document.querySelectorAll('.eps-actions').forEach(el => el.remove());
  }

  function moveSearchNextToLogo() {
    const header = document.querySelector('header, .navbar, .top-nav, nav[role="navigation"]');
    if (!header) return;
    const logo = header.querySelector('a[aria-label="Logo"], .site-logo, .logo, a[href="/"]');
    const searchBtn = header.querySelector('.DocSearch-Button');
    if (logo && searchBtn && logo.nextSibling !== searchBtn) {
      logo.parentElement.insertBefore(searchBtn, logo.nextSibling);
    }
  }

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
