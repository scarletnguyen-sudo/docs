(function () {
  /**
   * 1. Helper function to run code when the DOM is ready.
   */
  const ready = (fn) =>
    document.readyState !== "loading"
      ? fn()
      : document.addEventListener("DOMContentLoaded", fn);

  /**
   * 2. Selectors
   * Defines the elements that make up an accordion.
   */
  const GROUP_SELECTOR = 'aside .group, [data-accordion-group]';
  const HEAD_SELECTOR = '.group-head, button, [data-accordion-head]';
  const BODY_SELECTOR = '.group-body, [data-accordion-body]';

  /**
   * 3. Core Accordion Logic
   * Initializes a single accordion group.
   */
  function initAccordion(group) {
    // Prevent initializing the same element twice
    if (group.dataset.epsInit === "1") return;
    
    const head = group.querySelector(HEAD_SELECTOR);
    const body = group.querySelector(BODY_SELECTOR);

    if (!head || !body) return; // Not a valid accordion

    group.dataset.epsInit = "1";

    // --- Helper function to set the body height to fit its content ---
    const setOpenHeight = () => {
      // Set to 'auto' to measure its natural height
      body.style.height = 'auto';
      const h = body.scrollHeight;
      body.style.height = h + 'px';
    };

    // --- Set the initial state on page load ---
    if (group.classList.contains('collapsed')) {
      body.style.height = '0px';
    } else {
      // If open by default, set its correct height
      setOpenHeight();
    }

    // --- Click Event Handler ---
    head.addEventListener('click', () => {
      const isCollapsed = group.classList.toggle('collapsed');

      if (isCollapsed) {
        // --- CLOSE ---
        // Start from current height (in case it was 'auto')
        body.style.height = body.scrollHeight + 'px';
        // Wait for next frame, then transition to 0
        requestAnimationFrame(() => {
          body.style.height = '0px';
        });
      } else {
        // --- OPEN ---
        // Start from 0 (already set), then transition to content height
        requestAnimationFrame(() => {
          setOpenHeight();
        });
      }
    });

    // --- Auto-update height if content inside changes ---
    // This is robust: it fixes issues if images load late
    const resizeObserver = new ResizeObserver(() => {
      if (!group.classList.contains('collapsed')) {
        setOpenHeight();
      }
    });
    resizeObserver.observe(body);
  }

  /**
   * 4. Main Initializer
   * Finds and initializes all accordions on the page.
   */
  function initAllAccordions() {
    document.querySelectorAll(GROUP_SELECTOR).forEach(initAccordion);
  }

  /**
   * 5. Dynamic Content Handler (MutationObserver)
   * Watches for new elements added to the page and initializes
   * any new accordions. Throttled with requestAnimationFrame.
   */
  let mutationRafPending = false;
  const mutationObserver = new MutationObserver(() => {
    if (mutationRafPending) return;
    
    mutationRafPending = true;
    requestAnimationFrame(() => {
      // Re-run the initializer to find any new accordions
      initAllAccordions();
      mutationRafPending = false;
    });
  });

  /**
   * 6. Entry Point
   * Run the initializer when the DOM is ready, and
   * start observing for future changes.
   */
  ready(() => {
    // Run an initial scan
    initAllAccordions();
    
    // Watch the entire body for added/removed nodes
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  });

})();