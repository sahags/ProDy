Smart Search
===========

.. raw:: html

   <div style="max-width: 700px;">
     <p>Type an exact function name (e.g., <code>parsePDB</code>) to jump directly to its docs.
     Otherwise you'll be taken to full search results.</p>

     <form id="smartSearchForm">
       <input id="smartSearchInput" style="width: 100%; padding: 10px; font-size: 16px;"
              placeholder="Search (e.g., parsePDB or parse)" />
       <button type="submit" style="margin-top: 10px; padding: 8px 12px;">Search</button>
     </form>

     <p id="smartSearchStatus" style="margin-top: 10px; opacity: 0.8;"></p>
   </div>

.. raw:: html

   <script>
   (function () {
     const statusEl = document.getElementById("smartSearchStatus");
     const form = document.getElementById("smartSearchForm");
     const input = document.getElementById("smartSearchInput");

     // Works on RTD under /en/latest/ etc
     const basePath = window.location.pathname.split("/").slice(0,3).join("/");
     // Example: /en/latest
     const docsBase = basePath || "";
     const indexUrl = docsBase + "/_static/api_index.json";

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
       // dotted: prody.proteins.pdbfile.parsePDB
       const parts = dotted.split(".");
       const moduleParts = parts.slice(1, -1); // proteins/pdbfile
       const htmlPath = "reference/" + moduleParts.join("/") + ".html";
       return docsBase + "/" + htmlPath + "#" + dotted;
     }

     form.addEventListener("submit", async (e) => {
       e.preventDefault();
       const q = (input.value || "").trim();
       if (!q) return;

       try {
         const idx = await loadIndex();
         // exact match (case-sensitive). If you want case-insensitive, tell me.
         const dotted = idx[q];

         if (dotted) {
           window.location.href = toModulePage(dotted);
         } else {
           window.location.href = docsBase + "/search.html?q=" + encodeURIComponent(q);
         }
       } catch (err) {
         // fallback
         window.location.href = docsBase + "/search.html?q=" + encodeURIComponent(q);
       }
     });

     // Load index early for faster response
     loadIndex().catch(() => {});
   })();
   </script>
