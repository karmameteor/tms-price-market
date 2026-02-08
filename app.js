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
const availableOnly = $("#availableOnly");
const imin = $("#imin");
const imax = $("#imax");
const resetBtn = $("#reset");

const chipbar = $("#chipbar");
const statCount = $("#statCount");
const statAvg = $("#statAvg");
const statHot = $("#statHot");

let state = {
  type: "all",
  tag: "all",
  sort: "avg"
};

function median(nums){
  if(!nums.length) return null;
  const a = [...nums].sort((x,y)=>x-y);
  const m = Math.floor(a.length/2);
  return a.length % 2 ? a[m] : (a[m-1]+a[m])/2;
}

function setChipBar(){
  const chips = [];

  if(q.value.trim()) chips.push({k:"search", v:q.value.trim()});
  if(state.type !== "all") chips.push({k:"type", v:state.type});
  if(state.tag !== "all") chips.push({k:"tag", v:state.tag});
  if(Number(pmin.value) > 0 || Number(pmax.value) < 9999) chips.push({k:"price", v:`${pmin.value}-${pmax.value}m`});
  if(availableOnly.checked) chips.push({k:"available", v:"only"});
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
      if(k==="available") availableOnly.checked=false;
      if(k==="issued"){ imin.value=0; imax.value=999999; }
      render();
    });
  });
}

function syncSeg(val){
  $$(".seg-btn").forEach(b=>b.classList.toggle("active", b.dataset.type===val));
}
function syncTag(val){
  $$(".chip").forEach(b=>b.classList.toggle("active", b.dataset.tag===val));
}

function applyFilters(items){
  const term = q.value.trim().toLowerCase();
  const minP = Number(pmin.value || 0);
  const maxP = Number(pmax.value || 9999);
  const minI = Number(imin.value || 0);
  const maxI = Number(imax.value || 999999);

  return items.filter(it=>{
    if(term){
      const hay = `${it.name} ${it.tags.join(" ")} ${it.type}`.toLowerCase();
      if(!hay.includes(term)) return false;
    }
    if(state.type !== "all" && it.type !== state.type) return false;
    if(state.tag !== "all" && !it.tags.includes(state.tag)) return false;
    if(it.avg < minP || it.avg > maxP) return false;
    if(it.issued < minI || it.issued > maxI) return false;
    if(availableOnly.checked && !it.available) return false;
    return true;
  });
}

function applySort(items){
  const a = [...items];
  if(state.sort==="avg") a.sort((x,y)=>y.avg-x.avg);
  if(state.sort==="low") a.sort((x,y)=>x.low-y.low);
  if(state.sort==="high") a.sort((x,y)=>y.high-x.high);
  if(state.sort==="new") a.sort((x,y)=>String(y.id).localeCompare(String(x.id)));
  return a;
}

function card(it){
  const avail = it.available ? `<span class="badge ok">Available</span>` : `<span class="badge">Not listed</span>`;
  const tag = it.tags.includes("timeless") ? `<span class="badge gold">Timeless</span>` : "";

  return `
    <article class="card">
      <div class="card-top">
        <div class="thumb"><img src="${it.img}" alt="" /></div>
        <div class="meta">
          <div class="name">${it.name}</div>
          <div class="subline">
            <span class="badge">${it.type.toUpperCase()}</span>
            <span class="badge">Issued: ${it.issued.toLocaleString()}</span>
            ${avail}
            ${tag}
          </div>
        </div>
      </div>

      <div class="card-mid">
        <div class="prices">
          <div class="pbox">
            <div class="k">Avg</div>
            <div class="v avg">${it.avg}m</div>
          </div>
          <div class="pbox">
            <div class="k">Low</div>
            <div class="v">${it.low}m</div>
          </div>
          <div class="pbox">
            <div class="k">High</div>
            <div class="v">${it.high}m</div>
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button class="btn btn-primary" onclick="alert('Mock: Buy flow')">Buy</button>
        <button class="btn" onclick="alert('Mock: Sell flow')">Sell</button>
      </div>
    </article>
  `;
}

function render(){
  const filtered = applyFilters(window.ITEMS || []);
  const sorted = applySort(filtered);

  grid.innerHTML = sorted.map(card).join("");

  // stats
  statCount.textContent = sorted.length;
  const med = median(sorted.map(x=>x.avg));
  statAvg.textContent = med === null ? "—" : String(Math.round(med*10)/10);

  // most traded = highest issued in results
  const hot = sorted.slice().sort((a,b)=>b.issued-a.issued)[0];
  statHot.textContent = hot ? hot.name : "—";

  setChipBar();
}

/* UI wiring */
q.addEventListener("input", render);

toggleFilters.addEventListener("click", ()=>{
  filtersPanel.classList.toggle("open");
});
closeFilters.addEventListener("click", ()=>{
  filtersPanel.classList.remove("open");
});

priceSlider.addEventListener("input", ()=>{
  pmax.value = priceSlider.value;
  render();
});
[pmin,pmax,availableOnly,imin,imax].forEach(el => el.addEventListener("input", render));

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
  state.type="all"; state.tag="all"; state.sort="avg";
  q.value="";
  pmin.value=0; pmax.value=9999; priceSlider.value=9999;
  availableOnly.checked=false;
  imin.value=0; imax.value=999999;
  syncSeg("all"); syncTag("all");
  render();
});

/* Modal mock */
const modal = $("#modal");
const newPostBtn = $("#newPostBtn");
const closeModal = $("#closeModal");
const cancelModal = $("#cancelModal");
const saveModal = $("#saveModal");

function openModal(){ modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); }
function closeModalFn(){ modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); }

newPostBtn.addEventListener("click", openModal);
closeModal.addEventListener("click", closeModalFn);
cancelModal.addEventListener("click", closeModalFn);
modal.addEventListener("click", (e)=>{ if(e.target===modal) closeModalFn(); });
saveModal.addEventListener("click", ()=>{ alert("Mock saved. Next step: write to JSON / GitHub Issue."); closeModalFn(); });

/* init */
render();
