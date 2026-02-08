const grid = document.getElementById("grid");
const search = document.getElementById("search");

function render(items){

  grid.innerHTML = items.map(item => {

    const priceText =
      item.price == null
        ? "TBC"
        : item.price + " chaos scrolls";

    return `
      <div class="card">
        <img src="${item.img}">
        <h3>${item.name}</h3>
        <div class="badge">Issued: ${item.issued}</div>
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

function resetFilters(){
  search.value="";
  render(ITEMS);
}

search.addEventListener("input", filter);

render(ITEMS);
