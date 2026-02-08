window.addEventListener("DOMContentLoaded", () => {

  const grid = document.getElementById("grid");
  const search = document.getElementById("search");
  const resetBtn = document.getElementById("resetBtn");
  const searchTerm = document.getElementById("searchTerm");
  const resultsCount = document.getElementById("resultsCount");
  const detail = document.getElementById("detail");
  const backBtn = document.getElementById("backBtn");
  const detailImg = document.getElementById("detailImg");
  const detailName = document.getElementById("detailName");
  const detailMeta = document.getElementById("detailMeta");
  const detailPrice = document.getElementById("detailPrice");
  const buyBtn = document.getElementById("buyBtn");
  const categorySelect = document.getElementById("categorySelect");

  const ITEMS = window.ITEMS;
  const DISCORD_MARKETPLACE_URL = "https://discord.com/channels/1354002181744885914/1450422964658114621";

  function getCategory(item){
    if (item.category) return item.category;
    if (item.meta && item.meta.toLowerCase().includes("equip")) return "Equips";
    return "Items";
  }

  function render(list){
    grid.innerHTML = list.map(item => {

      const priceText =
        item.price == null
          ? "TBC"
          : item.price + " chaos scrolls";

      return `
        <div class="card" data-name="${item.name}">
          <img src="${item.img}" alt="${item.name}" />
          <h3>${item.name}</h3>
          <p class="meta">${item.meta ?? "Item"}</p>
          <div class="price">Current Price: ${priceText}</div>
        </div>
      `;
    }).join("");
  }

  function filter(){
    const term = search.value.toLowerCase();
    const selectedCategory = categorySelect.value;

    const filtered = ITEMS.filter(i =>
      i.name.toLowerCase().includes(term) &&
      (selectedCategory === "all" || getCategory(i) === selectedCategory)
    );

    searchTerm.textContent = term ? term : "all";
    resultsCount.textContent = `${filtered.length} results`;
    render(filtered);
  }

  function reset(){
    search.value="";
    categorySelect.value = "all";
    detail.classList.add("hidden");
    render(ITEMS);
    searchTerm.textContent = "all";
    resultsCount.textContent = `${ITEMS.length} results`;
  }

  function openDetail(item){
    detailImg.src = item.img;
    detailImg.alt = item.name;
    detailName.textContent = item.name;
    detailMeta.textContent = item.meta ?? "Item details will appear here.";
    detailPrice.textContent = item.price == null ? "TBC" : `${item.price} chaos scrolls`;
    buyBtn.href = `${DISCORD_MARKETPLACE_URL}/search?query=${encodeURIComponent(item.name)}`;
    detail.classList.remove("hidden");
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  search.addEventListener("input", filter);
  resetBtn.addEventListener("click", reset);
  categorySelect.addEventListener("change", filter);
  backBtn.addEventListener("click", () => detail.classList.add("hidden"));

  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (!card) return;
    const item = ITEMS.find((entry) => entry.name === card.dataset.name);
    if (!item) return;
    openDetail(item);
  });

  render(ITEMS);
  resultsCount.textContent = `${ITEMS.length} results`;
});
