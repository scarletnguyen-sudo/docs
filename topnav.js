function buildTopActions() {
  let cluster = document.querySelector('.eps-actions');
  if (!cluster) {
    cluster = document.createElement('div');
    cluster.className = 'eps-actions';
    document.body.appendChild(cluster);
  }

  // --- Order: Theme → Copy page → Open app ---
  cluster.innerHTML = ''; // reset before adding in order

  // Theme toggle first
  const themeBtn = document.querySelector(
    'button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]'
  );
  if (themeBtn) {
    const clone = themeBtn.cloneNode(true);
    clone.classList.add('eps-btn', 'theme');
    cluster.appendChild(clone);
  }

  // Copy page second
  const copyBtn = document.createElement('button');
  copyBtn.className = 'eps-btn copy';
  copyBtn.type = 'button';
  copyBtn.textContent = 'Copy page';
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
      setTimeout(() => {
        copyBtn.classList.remove('done');
        copyBtn.textContent = 'Copy page';
      }, 1300);
    } catch {
      alert('Copy failed — please copy manually.');
    }
  });
  cluster.appendChild(copyBtn);

  // Open app button last
  const openBtn = document.createElement('a');
  openBtn.className = 'eps-btn open';
  openBtn.href = 'https://one.epsilo.io';
  openBtn.textContent = 'Open app';
  openBtn.target = '_blank';
  cluster.appendChild(openBtn);
}

function supportPill() {
  // Bottom-left: "Get support" instead of “Contact support”
  if (!document.querySelector('.eps-support')) {
    const a = document.createElement('a');
    a.className = 'eps-support';
    a.href = 'mailto:support@epsilo.io'; // or your Helpdesk link
    a.textContent = 'Get support';
    document.body.appendChild(a);
  }
}
