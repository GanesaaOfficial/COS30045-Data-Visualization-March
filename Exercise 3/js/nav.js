// Injects shared header + nav, highlights active page
(function () {
  const pages = [
    { href: "index.html",      label: "🏠 Home" },
    { href: "technology.html", label: "📊 Technology & Sizes" },
    { href: "brands.html",     label: "🏷️ Brands" },
    { href: "power.html",      label: "⚡ Power Analysis" },
    { href: "ratings.html",    label: "⭐ Star Ratings" },
    { href: "conclusion.html", label: "✅ Conclusion" }
  ];

  const current = location.pathname.split("/").pop() || "index.html";

  const navItems = pages.map(p =>
    `<li><a href="${p.href}" class="${current === p.href ? "active" : ""}">${p.label}</a></li>`
  ).join("");

  document.getElementById("site-header").innerHTML = `
    <header>
      <div class="header-inner">
        <div class="header-brand">
          <span class="icon">📺</span>
          <div>
            <h1>TV Energy Consumption</h1>
            <p>A Data Story — COS30045 Exercise 3</p>
          </div>
        </div>
      </div>
    </header>
    <nav>
      <ul>${navItems}</ul>
    </nav>
  `;
})();
