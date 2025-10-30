(function () {
  const ready = (fn) =>
    document.readyState !== "loading"
      ? fn()
      : document.addEventListener("DOMContentLoaded", fn);

  function animateAccordions() {
    const groups = document.querySelectorAll(
      'aside .group, .Sidebar_group__ , .mintlify-group'
    );

    groups.forEach((group) => {
      const head =
        group.querySelector("button, .group-head") ||
        group.querySelector(".Sidebar_header__");
      const body =
        group.querySelector(".group-body") ||
        group.querySelector(".Sidebar_links__");

      if (!head || !body) return;

      // Set initial state
      body.style.overflow = "hidden";
      body.style.transition = "height 0.25s ease";
      if (group.classList.contains("collapsed")) {
        body.style.height = "0px";
      } else {
        body.style.height = body.scrollHeight + "px";
      }

      head.addEventListener("click", () => {
        const isCollapsed = group.classList.toggle("collapsed");
        if (isCollapsed) {
          body.style.height = "0px";
        } else {
          body.style.height = body.scrollHeight + "px";
        }
      });
    });
  }

  // Handle dynamic navigation reloads
  const mo = new MutationObserver(() => animateAccordions());
  mo.observe(document.body, { childList: true, subtree: true });

  ready(() => setTimeout(animateAccordions, 300));
})();
