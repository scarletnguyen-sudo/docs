(function () {
  const ready = (fn) =>
    document.readyState !== "loading"
      ? fn()
      : document.addEventListener("DOMContentLoaded", fn);

  // Chọn theo cấu trúc ổn định: aside nav + nhóm có header & body
  const GROUP_SELECTOR = 'aside .group, [data-accordion-group]';
  const HEAD_SELECTOR  = '.group-head, button, [data-accordion-head]';
  const BODY_SELECTOR  = '.group-body, [data-accordion-body]';

  function initAccordion(group) {
    if (group.dataset.epsInit === "1") return; // tránh double-bind
    const head = group.querySelector(HEAD_SELECTOR);
    const body = group.querySelector(BODY_SELECTOR);
    if (!head || !body) return;

    group.dataset.epsInit = "1";

    // Setup transition
    body.style.overflow = "hidden";
    body.style.transition = "height 0.25s ease";

    // Tính height mở
    const setOpenHeight = () => {
      // reset về auto để đo đúng
      body.style.height = 'auto';
      const h = body.scrollHeight;
      body.style.height = h + 'px';
    };

    // State initial
    if (group.classList.contains('collapsed')) {
      body.style.height = '0px';
    } else {
      setOpenHeight();
    }

    // ResizeObserver: nội dung đổi thì cập nhật height khi đang mở
    const ro = new ResizeObserver(() => {
      if (!group.classList.contains('collapsed')) setOpenHeight();
    });
    ro.observe(body);

    head.addEventListener('click', () => {
      const isCollapsed = group.classList.toggle('collapsed');
      if (isCollapsed) {
        // từ current height về 0 để có animation
        const current = body.scrollHeight;
        body.style.height = current + 'px';
        requestAnimationFrame(() => {
          body.style.height = '0px';
        });
      } else {
        // từ 0 -> auto
        body.style.height = '0px';
        requestAnimationFrame(() => {
          setOpenHeight();
        });
      }
    });
  }

  function animateAccordions() {
    document.querySelectorAll(GROUP_SELECTOR).forEach(initAccordion);
  }

  // MutationObserver có throttle nhẹ để không spam
  let raf = false;
  const mo = new MutationObserver(() => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      raf = false;
      animateAccordions();
    });
  });
  ready(() => {
    setTimeout(animateAccordions, 300);
    mo.observe(document.body, { childList: true, subtree: true });
  });
})();