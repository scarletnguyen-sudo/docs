const NAVBAR_SELECTOR = "#navbar";
const MENU_SELECTOR = "#page-context-menu";

function attachMenuIfNeeded() {
  const navbar = document.querySelector(NAVBAR_SELECTOR);
  const menu = document.querySelector(MENU_SELECTOR);

  if (navbar && menu && !navbar.contains(menu)) {
    navbar.appendChild(menu);
    menu.style.display = 'flex';
  }
}

// Observe the entire document for changes
const observer = new MutationObserver(() => {
  attachMenuIfNeeded();
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Run once at startup too
attachMenuIfNeeded();