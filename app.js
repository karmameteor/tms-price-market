window.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("grid");
  const search = document.getElementById("search");
  const resetBtn = document.getElementById("resetBtn");
  const debug = document.getElementById("debug");

  // Safety checks (so it never silently fails)
  if (!grid || !search || !resetBtn) {
    if (debug) debug.innerText = "Error: Missing HTML elements (#grid, #search, #resetBtn).";
    return;
  }

  // IMPORTANT: Use window.ITEMS (because data.js sets window.ITEMS)
  const ITEMS = window.ITEMS;

  if (!Array.isArray(ITEMS)) {
    debug.innerText = "Error: ITEMS not loaded. Check script order: data.js must be ABOVE app.js.";
    return;
  }

  debug.innerText = `Loaded ${ITEMS.length} items ✅`;

  function render(list) {
    grid.innerHTML = list.map(item => {
      const priceText = item.price == null ? "TBC" : `${item.price} chaos scrolls`;

      return `
        <div class="card">
          <img src="${item.img}" alt="${item.name}" />
          <h3>${item.name}</h3>
          <div class="badge">Issued: ${Number(item.issued).toLocaleString()}</div>
          <div class="price">Current Price: ${priceText}</div>
        </div>
      `;
    }).join("");
  }

  function applyFilter() {
    const term = search.value.trim().toLowerCase();
    const filtered = ITEMS.filter(i => i.name.toLowerCase().includes(term));
    render(filtered);
  }

  search.addEventListener("input", applyFilter);
  resetBtn.addEventListener("click", () => {
    search.value = "";
    render(ITEMS);
  });

  // Initial render
  render(ITEMS);
});
