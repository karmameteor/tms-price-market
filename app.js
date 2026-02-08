window.addEventListener("DOMContentLoaded", () => {

  const grid = document.getElementById("grid");
  const search = document.getElementById("search");
  const resetBtn = document.getElementById("resetBtn");

  const ITEMS = window.ITEMS;

  function render(list){
    grid.innerHTML = list.map(item => {

      const priceText =
        item.price == null
          ? "TBC"
          : item.price + " chaos scrolls";

      return `
        <div class="card">
          <img src="${item.img}" />
          <h3>${item.name}</h3>
          <div class="price">Current Price: ${priceText}</div>
        </div>
      `;
    }).join("");
  }

  function filter(){
    const term = search.value.toLowerCase();

    const filtered = ITEMS.filter(i =>
      i.name.toLowerCase().includes(term)
    );

    render(filtered);
  }

  function reset(){
    search.value="";
    render(ITEMS);
  }

  search.addEventListener("input", filter);
  resetBtn.addEventListener("click", reset);

  render(ITEMS);
});
