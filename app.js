window.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const grid = $("#grid");
  const q = $("#q");

  const filtersPanel = $("#filtersPanel");
  const toggleFilters = $("#toggleFilters");
  const closeFilters = $("#closeFilters");

  const pmin = $("#pmin");
  const pmax = $("#pmax");
  const priceSlider = $("#priceSlider");
  const imin = $("#imin");
  const imax = $("#imax");
  const resetBtn = $("#reset");

  const chipbar = $("#chipbar");
  const statCount = $("#statCount");
  const statMedian = $("#statMedian");
  const statHot = $("#statHot");

  if (!Array.isArray(window.ITEMS)) {
    alert("data.js not loaded. Make sure data.js is ABOVE app.js in index.html");
    return;
  }

  let state = { type: "all", tag: "all", sort: "price" };

  function median(nums){
    if(!nums.length) return null;
    const a = [...nums].sort((x,y)=>x-y);
    const m = Math.floor(a.length/2);
    return a.length % 2 ? a[m] : (a[m-1]+a[m])/2;
  }

  function normalizePrice(it){
    return (it.currentPriceCS === null || it.currentPriceCS === undefined)
      ? null
      : Number(it.currentPriceCS);
  }

  function syncSeg(val){
    $$(".seg-btn").forEach(b => b.classList.toggle("active", b.dataset.type === val));
  }

  function syncTag(val){
    $$(".chip").forEach(b => b.classList.toggle("active", b.dataset.tag === val));
  }

  function setChipBar(){
    const chips = [];
    if(q.value.trim()) chips.push({k:"search", v:q.value.trim()});
    if(state.type !== "all") chips.push({k:"type", v:state.type});
    if(state.tag !== "all") chips.push({k:"tag", v:state.tag});
    if(Number(pmin.value) > 0 || Number(pmax.value) < 9999) chips.push({k:"price", v:`${pmin.value}-${pmax.value} CS`});
    if(Number(imin.value) > 0 || Number(imax.value) < 999999) chips.push({k:"issued", v:`${imin.value}-${imax.value}`});
    chips.push({k:"sort", v:state.sort});

    chipbar.innerHTML = chips.map(c => `
      <span class="pill">
        ${c.k}: <b>${c.v}</b>
        ${c.k === "sort" ? "" : `<button data-clear="${c.k}" title="remove">✕</button>`}
      </span>
    `).join("");

    chipbar.querySelectorAll("button[data-clear]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const k = btn.dataset.clear;
        if(k==="search") q.value="";
        if(k==="type") { state.type="all"; syncSeg("all"); }
        if(k==="tag")  { state.tag="all"; syncTag("all"); }
        if(k==="price"){ pmin.value=0; pmax.value=9999; priceSlider.value=9999; }
        if(k==="issued"){ imin.value=0; imax.value=999999; }
        render();
      });
    });
  }

  function applyFilters(items){
    let term = q.value.trim().toLowerCase();
    term = term.replace("helmet", "helm"); // so "helmet" matches helm tag

    const minP = Number(pmin.value || 0);
    const maxP = Number(pmax.value || 9999);
    const minI = Number(imin.value || 0);
    const maxI = Number(imax.value || 999999);

    return items.filter(it=>{
      if(term){
        const hay = `${it.name} ${(it.tags||[]).join(" ")} ${it.type}`.toLowerCase();
        if(!hay.includes(term)) return false;
      }

      if(state.type !== "all" && it.type !== state.type) return false;
      if(state.tag !== "all" && !(it.tags||[]).includes(state.tag)) return false;

      if(it.issued < minI || it.issued > maxI) return false;

      const p = normalizePrice(it);
      if(p === null){
        if(maxP < 9999) return false;
      }else{
        if(p < minP || p > maxP) return false;
      }

      return true;
    });
  }

  function applySort(items){
    const a = [...items];

    if(state.sort==="price"){
      a.sort((x,y)=>{
        const px = normalizePrice(x);
        const py = normalizePrice(y);
        if(px === null && py === null) return 0;
        if(px === null) return 1;
        if(py === null) return -1;
        return px - py;
      });
    }

    if(state.sort==="issued"){
      a.sort((x,y)=>y.issued - x.issued);
    }

    if(state.sort==="name"){
      a.sort((x,y)=>x.name.localeCompare(y.name));
    }

    return a;
  }

  function card(it){
    const price = normalizePrice(it);
    const priceText = price === null ? `<span class="tbc">TBC</span>` : `${price} chaos scrolls`;

    return `
      <article class="card">
        <div class="card-top">
          <div class="thumb"><img src="${it.img}" alt="" /></div>
          <div class="meta">
            <div class="name">${it.name}</div>
            <div class="subline">
              <span class="badge">${it.type.toUpperCase()}</span>
              <span class="badge">Issued: ${Number(it.issued).toLocaleString()}</span>
            </div>

            <div class="priceblock">
              <div class="k">Current Price</div>
              <div class="v">${priceText}</div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function render(){
    const filtered = applyFilters(window.ITEMS);
    const sorted = applySort(filtered);

    grid.innerHTML = sorted.map(card).join("");

    statCount.textContent = sorted.length;

    const prices = sorted.map(normalizePrice).filter(v=>v !== null);
    const med = median(prices);
    statMedian.textContent = med === null ? "—" : String(Math.round(med*10)/10);

    const hot = sorted.slice().sort((a,b)=>b.issued-a.issued)[0];
    statHot.textContent = hot ? hot.name : "—";

    setChipBar();
  }

  q.addEventListener("input", render);
  toggleFilters.addEventListener("click", ()=> filtersPanel.classList.toggle("open"));
  closeFilters.addEventListener("click", ()=> filtersPanel.classList.remove("open"));

  priceSlider.addEventListener("input", ()=>{
    pmax.value = priceSlider.value;
    render();
  });

  [pmin,pmax,imin,imax].forEach(el => el.addEventListener("input", render));

  $$(".seg-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.type = btn.dataset.type;
      syncSeg(state.type);
      render();
    });
  });

  $$(".chip").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.tag = btn.dataset.tag;
      syncTag(state.tag);
      render();
    });
  });

  $$(".sortrow .btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.sort = btn.dataset.sort;
      render();
    });
  });

  resetBtn.addEventListener("click", ()=>{
    state.type="all"; state.tag="all"; state.sort="price";
    q.value="";
    pmin.value=0; pmax.value=9999; priceSlider.value=9999;
    imin.value=0; imax.value=999999;
    syncSeg("all"); syncTag("all");
    render();
  });

  render();
});
