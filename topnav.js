(function () {
  const ready = (fn) =>
    document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  function headerEl() {
    return document.querySelector('header, .navbar, nav[role="navigation"]');
  }

  function ensureCluster() {
    const header = headerEl();
    if (!header) return null;

    const signIn =
      header.querySelector('.primary a, .primary button') ||
      header.querySelector('a[href^="https://one.epsilo.io"], a[href*="sign"]');

    if (!signIn) return null;

    const exists = signIn.closest('.eps-nav-actions');
    if (exists) return exists;

    const cluster = document.createElement('div');
    cluster.className = 'eps-nav-actions';
    const parent = signIn.parentElement;
    parent.parentElement.insertBefore(cluster, parent);
    cluster.appendChild(parent);
    return cluster;
  }

  function makeBtn(text, className, onClick) {
    const b = document.createElement('button');
    b.className = `eps-btn ${className||''}`.trim();
    b.type = 'button';
    b.textContent = text;
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }

  function buildCopy() {
    return makeBtn('Copy', 'copy', async function () {
      const title = document.querySelector('h1')?.innerText?.trim() || document.title;
      const url = location.href;
      const sections = Array.from(document.querySelectorAll('h2')).slice(0, 8)
        .map(h => `- ${h.textContent.trim()}`).join('\n');
      const text = `${title}\n${url}${sections ? `\n\nSections:\n${sections}` : ''}`;
      try {
        await navigator.clipboard.writeText(text);
        this.classList.add('done'); this.textContent = 'Copied';
        setTimeout(() => { this.classList.remove('done'); this.textContent = 'Copy'; }, 1100);
      } catch { alert('Copy failed — copy the link from the address bar.'); }
    });
  }

  function buildDropdown() {
    const wrap = document.createElement('div');
    wrap.className = 'eps-dropdown';
    const trigger = makeBtn('Resources ▾');
    const menu = document.createElement('ul');
    menu.className = 'eps-dropdown-menu';
    menu.innerHTML = `
      <li><a href="/changelog">Changelog</a></li>
      <li><a href="/helpcenter">Help Center</a></li>
      <li><a href="/use-cases">Use Cases</a></li>
    `;
    trigger.addEventListener('click', (e) => { e.stopPropagation(); wrap.classList.toggle('open'); });
    document.addEventListener('click', () => wrap.classList.remove('open'));
    menu.addEventListener('click', () => wrap.classList.remove('open'));
    wrap.appendChild(trigger); wrap.appendChild(menu);
    return wrap;
  }

  function buildOpenApp() {
    return makeBtn('Open app', 'open', () => { location.href = 'https://one.epsilo.io'; });
  }

  function installTopBar() {
    const cluster = ensureCluster();
    if (!cluster) return;
    if (!cluster.querySelector('.eps-dropdown')) cluster.insertBefore(buildDropdown(), cluster.firstChild);
    if (!cluster.querySelector('.eps-btn.copy')) cluster.insertBefore(buildCopy(), cluster.querySelector('.primary')?.parentElement || cluster.lastChild);
    // Optional: show “Open app” to the left of Copy
    if (!cluster.querySelector('.eps-btn.open')) cluster.insertBefore(buildOpenApp(), cluster.firstChild);
  }

  function wrapToc() {
    // Mintlify keeps changing classnames; catch common ones
    const rawToc = document.querySelector('aside .on-this-page, .on-this-page, nav.toc, aside nav');
    if (!rawToc) return;

    if (rawToc.closest('.eps-toc-card')) return; // already wrapped

    const card = document.createElement('div');
    card.className = 'eps-toc-card';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = 'On this page';

    const parent = rawToc.parentElement;
    card.appendChild(title);
    // move the actual list into the card
    card.appendChild(rawToc);
    parent.appendChild(card);

    // Active link highlighter
    const headings = Array.from(document.querySelectorAll('h2[id], h3[id]'));
    const links = Array.from(card.querySelectorAll('a[href^="#"]'));
    const map = new Map(links.map(a => [decodeURIComponent(a.getAttribute('href')).slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const a = map.get(e.target.id);
        if (!a) return;
        if (e.isIntersecting) {
          links.forEach(x => x.classList.remove('active'));
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: [0, 1] });
    headings.forEach(h => io.observe(h));
  }

  const mo = new MutationObserver(() => { installTopBar(); wrapToc(); });

  ready(() => {
    // In case header/TOC mount late
    let tries = 0;
    const t = setInterval(() => { installTopBar(); wrapToc(); if(++tries>20) clearInterval(t); }, 150);
    installTopBar(); wrapToc();
    mo.observe(document.body, { childList: true, subtree: true });
  });
})();
