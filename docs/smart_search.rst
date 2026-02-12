<script>
(function () {
  const statusEl = document.getElementById("smartSearchStatus");
  const form = document.getElementById("smartSearchForm");
  const input = document.getElementById("smartSearchInput");

  const basePath = window.location.pathname.split("/").slice(0,3).join("/");
  const docsBase = basePath || "";
  const indexUrl = docsBase + "/_static/api_index.json";

  let apiIndex = null;

  async function loadIndex() {
    if (apiIndex) return apiIndex;
    const res = await fetch(indexUrl, { cache: "force-cache" });
    if (!res.ok) throw new Error("Failed to load api_index.json");
    apiIndex = await res.json();
    return apiIndex;
  }

  function toModulePage(dotted) {
    const parts = dotted.split(".");
    const moduleParts = parts.slice(1, -1);
    const htmlPath = "reference/" + moduleParts.join("/") + ".html";
    return docsBase + "/" + htmlPath + "#" + dotted;
  }

  function pickBestTarget(name, dottedList) {
    // Prefer the canonical ProDy API location if present
    const preferredPrefix = "prody.proteins.pdbfile." + name;
    const exactPreferred = dottedList.find(d => d === preferredPrefix);
    if (exactPreferred) return exactPreferred;

    // Otherwise, prefer shortest dotted path (usually the core API, not database helpers)
    dottedList.sort((a, b) => a.length - b.length);
    return dottedList[0];
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = (input.value || "").trim();
    if (!q) return;

    try {
      const idx = await loadIndex();

      // exact-name match only:
      const dottedList = idx[q];  // list of dotted paths, or undefined

      if (Array.isArray(dottedList) && dottedList.length > 0) {
        const target = pickBestTarget(q, dottedList);
        window.location.href = toModulePage(target);
        return;
      }

      // no exact match => normal RTD search results
      window.location.href = docsBase + "/search.html?q=" + encodeURIComponent(q);
    } catch (err) {
      window.location.href = docsBase + "/search.html?q=" + encodeURIComponent(q);
    }
  });

})();
</script>
