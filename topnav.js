(function () {
  const ready = (fn) => (document.readyState !== 'loading'
    ? fn()
    : document.addEventListener('DOMContentLoaded', fn));

  /* ========== Helpers =================================================== */
  const qs  = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
  const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  /* ========== Top-right cluster ======================================== */
  function ensureTopRight() {
    const header = qs('header, .navbar, nav[role="navigation"]');
    if (!header) return;

    const signIn = header.querySelector('.primary a, .primary button');
    if (!signIn) return;

    const cluster = signIn.closest('.eps-nav-actions') || (() => {
      const c = document.createElement('div');
      c.className = 'eps-nav-actions';
      const parent = signIn.parentElement;
      parent.parentElement.insertBefore(c, parent);
      c.appendChild(parent);
      return c;
    })();

    if (!cluster.querySelector('.eps-dropdown')) {
      const dd = buildDropdown();
      cluster.insertBefore(dd, cluster.firstChild);
    }
    if (!cluster.querySelector('.eps-btn.copy')) {
      const cp = buildCopy();
      cluster.insertBefore(cp, cluster.querySelector('.primary')?.parentElement || cluster.lastChild);
    }
  }

  function buildCopy() {
    const b = document.createElement('button');
    b.className = 'eps-btn copy';
    b.textContent = 'Copy';
    b.addEventListener('click', async () => {
      const title = qs('h1')?.innerText?.trim() || document.title;
      const url = location.href;
      const sections = qsa('h2').slice(0, 8).map(h => `- ${h.textContent.trim()}`).join('\n');
      const text = `${title}\n${url}${sections ? `\n\nSections:\n${sections}` : ''}`;
      try{
        await navigator.clipboard.writeText(text);
        b.classList.add('done'); b.textContent='Copied';
        setTimeout(()=>{ b.classList.remove('done'); b.textContent='Copy'; }, 1100);
      }catch{ alert('Copy failed — copy from the address bar.'); }
    });
    return b;
  }

  function buildDropdown() {
    const wrap = document.createElement('div');
    wrap.className = 'eps-dropdown';
    const btn = document.createElement('button');
    btn.className = 'eps-btn';
    btn.textContent = 'Resources ▾';
    const menu = document.createElement('ul');
    menu.className = 'eps-dropdown-menu';
    menu.innerHTML = `
      <li><a href="/changelog">Changelog</a></li>
      <li><a href="/helpcenter">Help Center</a></li>
      <li><a href="/use-cases">Use Cases</a></li>
    `;
    btn.addEventListener('click', (e)=>{ e.stopPropagation(); wrap.classList.toggle('open'); });
    document.addEventListener('click', ()=> wrap.classList.remove('open'));
    menu.addEventListener('click', ()=> wrap.classList.remove('open'));
    wrap.append(btn, menu);
    return wrap;
  }

  /* ========== Sidebar: build collapsible groups ======================== */
  function enhanceSidebar() {
    // Try to find Mintlify's left nav container
    const sideRoot = qs('aside nav, .sidebar nav, aside .navigation, .sidebar');
    if (!sideRoot) return;

    // Avoid double-building
    if (qs('.eps-side')) return;

    // Extract groups from existing DOM
    const groups = [];
    qsa('aside .group, aside [data-group], .sidebar .group, .sidebar [data-group]').forEach(g => {
      groups.push({ el: g }); // legacy compatibility if Mintlify already groups
    });

    // If Mintlify doesn't expose groups, synthesize by headings in the left menu
    if (groups.length === 0) {
      const container = document.createElement('div');
      container.className = 'eps-side';
      const controls = document.createElement('div');
      controls.className = 'side-controls';
      controls.innerHTML = `
        <button class="mini" data-cmd="expand">Expand all</button>
        <button class="mini" data-cmd="collapse">Collapse all</button>
      `;
      container.appendChild(controls);

      // Build pseudo-groups from section headers in nav
      let current;
      qsa('aside a, .sidebar a').forEach(a => {
        const parentSection = a.closest('section, div[role="list"], ul, ol');
        const header = parentSection?.previousElementSibling?.innerText || a.closest('li')?.previousElementSibling?.innerText;
        const htext = header && header.trim() ? header.trim() : 'Docs';
        const key = slug(htext);
        if (!current || current.key !== key) {
          current = buildGroup(htext, key);
          container.appendChild(current.wrap);
        }
        const link = document.createElement('a');
        link.className = 'link';
        link.href = a.getAttribute('href');
        link.textContent = a.textContent.trim();
        if (location.pathname === link.getAttribute('href')) link.classList.add('active');
        current.body.appendChild(link);
      });

      // Replace existing sidebar nav with our container
      const aside = qs('aside');
      aside.innerHTML = '';
      aside.appendChild(container);
      aside.appendChild(Object.assign(document.createElement('div'), { className: 'eps-side-backdrop' }));

      // Controls behavior
      controls.addEventListener('click', (e) => {
        const cmd = e.target?.dataset?.cmd;
        if (!cmd) return;
        qsa('.eps-side .group').forEach(g => toggleGroup(g, cmd === 'collapse'));
      });

      // Mobile toggle
      ensureMobileToggle(aside);
      return;
    }

    // If Mintlify already has group DOM, you could map into our visuals if needed
  }

  function buildGroup(title, key) {
    const wrap = document.createElement('div');
    wrap.className = 'group';
    wrap.dataset.key = key;

    const head = document.createElement('button');
    head.className = 'group-head';
    head.innerHTML = `<span>${title}</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 9l4 4 4-4"/></svg>`;
    const body = document.createElement('div');
    body.className = 'group-body';

    // restore persisted state
    const collapsed = localStorage.getItem('side:'+key) === '1';
    if (collapsed) wrap.classList.add('collapsed');

    head.addEventListener('click', () => toggleGroup(wrap, !wrap.classList.contains('collapsed')));

    wrap.append(head, body);
    return { wrap, head, body, key };
  }

  function toggleGroup(groupEl, collapse) {
    const key = groupEl.dataset.key;
    if (collapse) {
      groupEl.classList.add('collapsed');
      localStorage.setItem('side:'+key, '1');
    } else {
      groupEl.classList.remove('collapsed');
      localStorage.setItem('side:'+key, '0');
    }
  }

  function ensureMobileToggle(aside) {
    if (qs('.eps-mobile-toggle')) return;
    const btn = document.createElement('button');
    btn.className = 'eps-mobile-toggle';
    btn.textContent = 'Menu';
    btn.addEventListener('click', () => {
      const panel = qs('.eps-side');
      panel.classList.toggle('open');
    });
    document.body.appendChild(btn);

    const backdrop = qs('.eps-side-backdrop');
    backdrop?.addEventListener('click', () => qs('.eps-side')?.classList.remove('open'));
  }

  /* ========== Right TOC card + active link ============================= */
  function cardToc() {
    const rawToc = qs('aside .on-this-page, .on-this-page, nav.toc, aside nav[aria-label="On this page"]');
    if (!rawToc || rawToc.closest('.eps-toc-card')) return;

    const card = document.createElement('div');
    card.className = 'eps-toc-card';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = 'On this page';
    rawToc.parentElement.appendChild(Object.assign(card, { appendChild: card.appendChild.bind(card) }));
    card.appendChild(title);
    card.appendChild(rawToc);

    const headings = qsa('h2[id], h3[id]');
    const links = qsa('a[href^="#"]', card);
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
    }, { rootMargin: '-40% 0px -55% 0px', threshold: [0,1] });
    headings.forEach(h => io.observe(h));
  }

  /* ========== SPA observer ============================================ */
  const mo = new MutationObserver(() => {
    ensureTopRight();
    enhanceSidebar();
    cardToc();
  });

  ready(() => {
    // multiple passes for late-mounting Mintlify UI
    let tries = 0;
    const t = setInterval(() => {
      ensureTopRight(); enhanceSidebar(); cardToc();
      if (++tries > 20) clearInterval(t);
    }, 150);

    mo.observe(document.body, { childList: true, subtree: true });
  });
})();
