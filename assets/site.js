// Daily Platter — homepage renderer
// Reads assets/posts.json (appended to automatically by the publishing automation)
// and renders the recipe grid + category filter + Pinterest save buttons.

function pinterestSaveUrl(pageUrl, imageUrl, description) {
  const base = "https://www.pinterest.com/pin/create/button/";
  const params = new URLSearchParams({ url: pageUrl, media: imageUrl, description: description || "" });
  return base + "?" + params.toString();
}

function cardHTML(post, siteOrigin) {
  const pageUrl = siteOrigin + "/recipes/" + post.slug + ".html";
  const saveUrl = pinterestSaveUrl(pageUrl, post.image, post.title);
  return `
    <a class="card" href="/recipes/${post.slug}.html" data-cat="${post.category || "all"}">
      <div class="thumb-wrap">
        <img src="${post.image}" alt="${post.title}" loading="lazy">
        <span class="save-btn" onclick="event.preventDefault(); window.open('${saveUrl}', '_blank', 'noopener,width=750,height=550');">Save</span>
      </div>
      <div class="body">
        <span class="cat">${post.category || "Recipe"}</span>
        <h3>${post.title}</h3>
        <div class="meta"><span>${post.time || "30 min"}</span><span>&middot;</span><span>${post.servings || "Serves 4"}</span></div>
      </div>
    </a>`;
}

async function initHomepage() {
  const grid = document.getElementById("recipe-grid");
  if (!grid) return;
  const origin = window.location.origin;
  try {
    const res = await fetch("/assets/posts.json", { cache: "no-store" });
    const posts = await res.json();
    posts.reverse(); // newest first
    renderGrid(posts, origin);
    wireCategoryFilter(posts, origin);
  } catch (e) {
    grid.innerHTML = "<p>Recipes are loading — check back in a moment.</p>";
  }
}

function renderGrid(posts, origin) {
  const grid = document.getElementById("recipe-grid");
  grid.innerHTML = posts.map(p => cardHTML(p, origin)).join("");
}

function wireCategoryFilter(posts, origin) {
  document.querySelectorAll(".nav-cats a[data-filter]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = link.dataset.filter;
      const filtered = cat === "all" ? posts : posts.filter(p => (p.category || "").toLowerCase() === cat.toLowerCase());
      renderGrid(filtered, origin);
    });
  });
}

document.addEventListener("DOMContentLoaded", initHomepage);
