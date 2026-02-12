(function () {
  function getDocsBase() {
    // /en/latest/smart_search.html -> /en/latest
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) return "/" + parts[0] + "/" + parts[1];
    return "";
  }

  const docsBase = getDocsBase();
  const indexUrl = docsBase + "/_static/api_index.json";

  const form = document.getElementById("smartSearchForm");
  const input = document.getElementById("smartSearchInput");
  const statusEl = document.getElementById("smartSearchStatus");

  let apiIndex = null;

  async function loadIndex() {
    if (apiIndex) return apiIndex;
    statusEl.textContent = "Loading API index…";
    const res = await fetch(indexUrl, { cache: "force-cache" });
    if (!res.ok) throw new Error("Failed to load api_index.json");
    apiIndex = await res.json();
    statusEl.textContent = "";
    return apiIndex;
  }

  function toModulePage(dotted) {
    const parts = dotted.split(".");
    const moduleParts = parts.slice(1, -1); // drop "prody" and function name
    const htmlPath = "reference/" + moduleParts.join("/") + ".html";
    return docsBase + "/" + htmlPath + "#" + dotted;
  }

  function pickBestTarget(name, dottedList) {
    const preferred = "prody.proteins.pdbfile." + name;
    const hit = dottedList.find(d => d === preferred);
    if (hit) return hit;

    // fallback: shortest dotted path
    return dottedList.slice().sort((a, b) => a.length - b.length)[0];
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = (input.value || "").trim();
    if (!q) return;

    try {
      const idx = await loadIndex();

      // exact name match (case sensitive)
      const dottedList = idx[q];

      if (Array.isArray(dottedList) && dottedList.length > 0) {
        const target = pickBestTarget(q, dottedList);
        window.location.href = toModulePage(target);
      } else {
        window.location.href = docsBase + "/search.html?q=" + encodeURIComponent(q);
      }
    } catch (err) {
      window.location.href = docsBase + "/search.html?q=" + encodeURIComponent(q);
    }
  });

  // preload
  loadIndex().catch(() => {});
})();
