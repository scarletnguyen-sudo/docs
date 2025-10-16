(function () {
  // Edit these paths/titles to match your sections
  const LINKS = [
    { href: "/introduction/welcome", label: "Introduction" },
    { href: "/features/aggregate/competitive-intelligence", label: "Features" },
    { href: "/connectors/shopee", label: "Integrations" },
    { href: "/use-cases/gmv-max", label: "Use Cases" },
    { href: "/glossary/index", label: "Glossary" },
    { href: "/changelog/index", label: "Changelog" }
  ];

  function currentMatch(href) {
    try {
      const here = location.pathname.replace(/\/+$/, "");
      const there = href.replace(/\/+$/, "");
      return here.startsWith(there);
    } catch { return false; }
  }

  function makeBar() {
    if (document.getElementById("eps-topnav")) return;

    const bar = document.createElement("div");
    bar.id = "eps-topnav";
    bar.setAttribute("role", "navigation");

    const ul = document.createElement("ul");
    LINKS.forEach(link => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = link.href;
      a.textContent = link.label;
      if (currentMatch(link.href)) a.classList.add("active");
      li.appendChild(a);
      ul.appendChild(li);
    });
    bar.appendChild(ul);

    // Insert under Mintlify header
    const header = document.querySelector("header") || document.body;
    header.after(bar);
  }

  // Run after the page paints
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", makeBar);
  } else {
    makeBar();
  }
})();
