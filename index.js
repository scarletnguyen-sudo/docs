const NAVBAR_SELECTOR = "#navbar";
const MENU_SELECTOR = "#page-context-menu";
const DARK_MODE_TOGGLE_SELECTOR = '[aria-label="Toggle dark mode"]';

function attachMenuIfNeeded() {
  const navbar = document.querySelector(NAVBAR_SELECTOR);
  const menu = document.querySelector(MENU_SELECTOR);
  const darkModeSelector = document.querySelector(DARK_MODE_TOGGLE_SELECTOR);

  if (navbar && menu && !navbar.contains(menu)) {
    navbar.appendChild(menu);
    menu.style.display = 'flex';
  }

  if (navbar && darkModeSelector && !navbar.contains(darkModeSelector)) {
    navbar.appendChild(darkModeSelector);
    darkModeSelector.style.display = 'flex';
    darkModeSelector.style.zIndex = 30;

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