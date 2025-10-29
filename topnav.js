/* topnav.js */
(function () {
  const ready = (fn) =>
    (document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn));

  function ensureCluster() {
    const header = document.querySelector('header, .navbar, .top-nav, nav[role="navigation"]');
    if (!header) return null;

    // Mintlify marks the CTA as ".primary"
    const primary =
      header.querySelector('.primary a, .primary button, nav .primary a, nav .primary button') ||
      header.querySelector('a[href^="https://one.epsilo.io"], a[href="/login"], a[href*="sign"]');

    if (!primary) return null;

    // If we already wrapped it, reuse the cluster
    const existingCluster = primary.closest('.eps-nav-actions');
    if (existingCluster) return existingCluster;

    // Build cluster and move the primary CTA inside it
    const cluster = document.createElement('div');
    cluster.className = 'eps-nav-actions';

    const primaryContainer = primary.parentElement;
    primaryContainer.parentElement.insertBefore(cluster, primaryContainer);
    cluster.appendChild(primaryContainer);

    return cluster;
  }

  function buildCopyButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'eps-btn copy';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const title = document.querySelector('h1')?.innerText?.trim() || document.title;
      const url = location.href;
      const sections = Array.from(document.querySelectorAll('h2')).slice(0, 8)
        .map(h => `- ${h.textContent.trim()}`).join('\n');
      const text = `${title}\n${url}${sections ? `\n\nSections:\n${sections}` : ''}`;
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('done');
        btn.textContent = 'Copied';
        setTimeout(() => { btn.classList.remove('done'); btn.textContent = 'Copy'; }, 1100);
      } catch {
        // minimal, user can fallback to address bar
        alert('Copy failed — please copy the link from the address bar.');
      }
    });
    return btn;
  }

  function buildDropdown() {
    const wrap = document.createElement('div');
    wrap.className = 'eps-dropdown';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'eps-btn';
    trigger.textContent = 'Resources ▾';

    const menu = document.createElement('ul');
    menu.className = 'eps-dropdown-menu';
    menu.innerHTML = `
      <li><a href="/changelog">Changelog</a></li>
      <li><a href="/helpcenter">Help Center</a></li>
      <li><a href="/use-cases">Use Cases</a></li>
    `;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.classList.toggle('open');
    });

    // Close when clicking elsewhere or on a link
    document.addEventListener('click', () => wrap.classList.remove('open'));
    menu.addEventListener('click', () => wrap.classList.remove('open'));

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  function apply() {
    const cluster = ensureCluster();
    if (!cluster) return;

    // Only add once
    if (!cluster.querySelector('.eps-btn.copy')) {
      const copyBtn = buildCopyButton();
      cluster.insertBefore(copyBtn, cluster.firstChild);
    }
    if (!cluster.querySelector('.eps-dropdown')) {
      const dropdown = buildDropdown();
      cluster.insertBefore(dropdown, cluster.firstChild);
    }
  }

  function observeSpa() {
    const mo = new MutationObserver(() => apply());
    mo.observe(document.body, { childList: true, subtree: true });
  }

  ready(() => {
    apply();
    observeSpa();
  });
})();
