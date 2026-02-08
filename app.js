const $ = (sel) => document.querySelector(sel);

const feed = $("#feed");
const q = $("#q");
const countEl = $("#count");
const termEl = $("#term");
const clearBtn = $("#clear");

const sortBtn = $("#sortBtn");
const sortMenu = $("#sortMenu");
const compact = $("#compact");

const modal = $("#modal");
const newPostBtn = $("#newPost");
const closeModal = $("#closeModal");
const cancelPost = $("#cancelPost");
const publishPost = $("#publishPost");
const npTitle = $("#npTitle");
const npAuthor = $("#npAuthor");
const npBody = $("#npBody");
const npThumb = $("#npThumb");

let sortMode = "newest";
let posts = [...(window.POSTS || [])];

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[m]));
}

function highlight(text, term){
  if(!term) return escapeHtml(text);
  const safe = escapeHtml(text);
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return safe.replace(re, `<span class="hl">$1</span>`);
}

function timeAgo(ts){
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  const m = Math.floor(s/60), h = Math.floor(m/60), d = Math.floor(h/24);
  if(d > 0) return `${d}d ago`;
  if(h > 0) return `${h}h ago`;
  if(m > 0) return `${m}m ago`;
  return `${s}s ago`;
}

function applySort(list){
  const a = [...list];
  if(sortMode === "newest") a.sort((x,y) => y.createdAt - x.createdAt);
  if(sortMode === "oldest") a.sort((x,y) => x.createdAt - y.createdAt);
  if(sortMode === "likes") a.sort((x,y) => (y.likes||0) - (x.likes||0));
  if(sortMode === "comments") a.sort((x,y) => (y.comments||0) - (x.comments||0));
  return a;
}

function matches(post, term){
  if(!term) return true;
  const t = term.toLowerCase();
  return (
    post.title.toLowerCase().includes(t) ||
    post.author.toLowerCase().includes(t) ||
    post.body.toLowerCase().includes(t)
  );
}

function render(){
  const term = q.value.trim();
  termEl.textContent = term || "";
  const filtered = posts.filter(p => matches(p, term));
  const sorted = applySort(filtered);

  countEl.textContent = sorted.length;

  feed.classList.toggle("compact", compact.checked);

  feed.innerHTML = sorted.map(p => {
    const title = highlight(p.title, term);
    const body = highlight(p.body, term);

    const prefix = `S&gt;`;
    const newBadge = p.newCount ? `<span class="new">(${p.newCount} New)</span>` : "";

    return `
      <article class="card">
        <div class="card-inner">
          <div class="left">
            <h3 class="title">
              <span class="prefix">${prefix}</span>
              ${title}
            </h3>

            <p class="sub">
              <span class="author">${escapeHtml(p.author)}:</span>
              ${body}
            </p>

            <div class="meta">
              <span class="chip">💬 ${p.comments ?? 0} ${newBadge}</span>
              <span class="chip">❤️ ${p.likes ?? 0}</span>
              <span class="chip">${timeAgo(p.createdAt)}</span>
            </div>
          </div>

          <div class="thumb">
            <img src="${escapeHtml(p.thumb || fallbackThumb(p.id))}" alt="" />
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function fallbackThumb(id){
  // deterministic placeholder
  const n = (id.split("").reduce((a,c)=>a+c.charCodeAt(0),0) % 1000);
  return `https://picsum.photos/seed/${n}/160/160`;
}

/* interactions */
q.addEventListener("input", render);

clearBtn.addEventListener("click", () => {
  q.value = "";
  q.focus();
  render();
});

sortBtn.addEventListener("click", () => {
  sortMenu.classList.toggle("open");
  sortMenu.setAttribute("aria-hidden", sortMenu.classList.contains("open") ? "false" : "true");
});

document.addEventListener("click", (e) => {
  if(!sortMenu.contains(e.target) && !sortBtn.contains(e.target)){
    sortMenu.classList.remove("open");
    sortMenu.setAttribute("aria-hidden", "true");
  }
});

sortMenu.addEventListener("click", (e) => {
  const btn = e.target.closest(".menuitem");
  if(btn){
    sortMode = btn.dataset.sort;
    sortMenu.classList.remove("open");
    sortMenu.setAttribute("aria-hidden", "true");
    render();
  }
});

compact.addEventListener("change", render);

/* modal */
function openModal(){
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  npTitle.value = "";
  npAuthor.value = "";
  npBody.value = "";
  npThumb.value = "";
  npTitle.focus();
}
function closeModalFn(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
}

newPostBtn.addEventListener("click", openModal);
closeModal.addEventListener("click", closeModalFn);
cancelPost.addEventListener("click", closeModalFn);
modal.addEventListener("click", (e) => { if(e.target === modal) closeModalFn(); });

publishPost.addEventListener("click", () => {
  const title = npTitle.value.trim();
  const author = npAuthor.value.trim() || "Unknown";
  const body = npBody.value.trim() || "";
  const thumb = npThumb.value.trim();

  if(!title){
    npTitle.focus();
    return;
  }

  posts.unshift({
    id: `p_${crypto.randomUUID?.() || String(Date.now())}`,
    title,
    author,
    body,
    likes: 0,
    comments: 0,
    createdAt: Date.now(),
    thumb: thumb || undefined
  });

  closeModalFn();
  render();
});

/* init */
q.value = "master ring"; // matches your screenshot vibe
render();
