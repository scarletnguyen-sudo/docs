(function () {
  const ready = (fn) =>
    document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  function buildCopy() {
    const b = document.createElement('button');
    b.className = 'eps-btn copy';
    b.textContent = 'Copy';
    b.addEventListener('click', async () => {
      const title = document.querySelector('h1')?.innerText?.trim() || document.title;
      const url = location.href;
      const sections = Array.from(document.querySelectorAll('h2')).slice(0, 6)
        .map(h => `- ${h.textContent.trim()}`).join('\n');
      const text = `${title}\n${url}${sections ? `\n\nSections:\n${sections}` : ''}`;
      try {
        await navigator.clipboard.writeText(text);
        b.classList.add('done');
        b.textContent = 'Copied';
        setTimeout(() => { b.classList.remove('done'); b.textContent = 'Copy'; }, 1100);
      } catch {
        alert('Copy failed — please copy from the address bar.');
      }
    });
    return b;
  }

  function buildDropdown() {
    const w = document.createElement('div');
    w.className = 'eps-dropdown';
    const trigger = document.createElement('button');
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
      w.classList.toggle('open');
    });
    document.addEventListener('click', () => w.classList.remove('open'));
    menu.addEventListener('click', () => w.classList.remove('open'));

    w.appendChild(trigger);
    w.appendChild(menu);
    return w;
  }

  function injectNav() {
    const header = document.querySelector('header, .navbar, nav[role="navigation"]');
    if (!header) return;

    const signIn = header.querySelector('.primary a, .primary button');
    if (!signIn) return;

    if (signIn.closest('.eps-nav-actions')) return;

    const cluster = document.createElement('div');
    cluster.className = 'eps-nav-actions';

    const parent = signIn.parentElement;
    parent.parentElement.insertBefore(cluster, parent);
    cluster.appendChild(buildDropdown());
    cluster.appendChild(buildCopy());
    cluster.appendChild(parent);
  }

  const observer = new MutationObserver(injectNav);

  ready(() => {
    injectNav();
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
