/* The Party Atlas — gallery, search, detail, and map-toggle wiring.
   Plain browser JS, no build step. Loaded as a classic <script defer>. */
(() => {
  "use strict";

  const state = {
    locations: [],
    filter: "",
    mapLoaded: false,
    mapVisible: false,
  };

  // --- DOM handles ---------------------------------------------------------
  const els = {
    gallery: document.getElementById("gallery"),
    emptyState: document.getElementById("empty-state"),
    filterInput: document.getElementById("filter-input"),
    viewToggle: document.getElementById("view-toggle"),
    toggleLabel: document.querySelector(".view-toggle__label"),
    galleryView: document.getElementById("gallery-view"),
    mapView: document.getElementById("map-view"),
    dialog: document.getElementById("detail-dialog"),
    detailBody: document.getElementById("detail-body"),
  };

  // --- Helpers -------------------------------------------------------------
  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  const matchesFilter = (loc, q) => {
    if (!q) return true;
    const haystack = [
      loc.nickname,
      loc.realName,
      loc.address,
      loc.lore,
      loc.category,
      ...(loc.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  };

  const byId = (id) => state.locations.find((l) => l.id === id);

  // --- Rendering -----------------------------------------------------------
  function renderGallery() {
    const q = state.filter.trim().toLowerCase();
    const visible = state.locations.filter((loc) => matchesFilter(loc, q));

    els.gallery.innerHTML = visible
      .map(
        (loc) => `
      <li class="card" data-id="${escapeHtml(loc.id)}">
        <button class="card__button" type="button" aria-haspopup="dialog">
          <span class="card__media">
            <img class="card__img" src="${escapeHtml(loc.image)}"
                 alt="${escapeHtml(loc.imageAlt || loc.nickname)}" loading="lazy" />
          </span>
          <span class="card__body">
            <span class="card__badge">${escapeHtml(loc.category || "lugar")}</span>
            <span class="card__title">${escapeHtml(loc.nickname)}</span>
            ${loc.realName ? `<span class="card__subtitle">${escapeHtml(loc.realName)}</span>` : ""}
          </span>
        </button>
      </li>`
      )
      .join("");

    els.emptyState.hidden = visible.length > 0;
  }

  function renderDetail(loc) {
    const coords = loc.coordinates
      ? `${loc.coordinates.lat.toFixed(5)}, ${loc.coordinates.lng.toFixed(5)}`
      : "Desconocidas";
    const tags = (loc.tags || [])
      .map((t) => `<li class="tag">${escapeHtml(t)}</li>`)
      .join("");

    els.detailBody.innerHTML = `
      <img class="detail__img" src="${escapeHtml(loc.image)}"
           alt="${escapeHtml(loc.imageAlt || loc.nickname)}" />
      <span class="detail__badge">${escapeHtml(loc.category || "lugar")}</span>
      <h2 class="detail__title">${escapeHtml(loc.nickname)}</h2>
      ${loc.realName ? `<p class="detail__realname">${escapeHtml(loc.realName)}</p>` : ""}
      <p class="detail__lore">${escapeHtml(loc.lore || "")}</p>
      <dl class="detail__facts">
        <dt>Dirección</dt><dd>${escapeHtml(loc.address || "Desconocida")}</dd>
        <dt>Coordenadas</dt><dd>${escapeHtml(coords)}</dd>
      </dl>
      ${tags ? `<ul class="detail__tags">${tags}</ul>` : ""}
      ${
        loc.coordinates
          ? `<button class="detail__map-link" type="button" data-show-on-map="${escapeHtml(
              loc.id
            )}">Ver en el mapa</button>`
          : ""
      }
    `;
    if (typeof els.dialog.showModal === "function") {
      els.dialog.showModal();
    } else {
      els.dialog.setAttribute("open", "");
    }
  }

  // --- Map (lazy) ----------------------------------------------------------
  function loadMapScript() {
    return new Promise((resolve, reject) => {
      if (state.mapLoaded) return resolve();
      // Leaflet JS first, then our map module.
      const leaflet = document.createElement("script");
      leaflet.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      leaflet.integrity =
        "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      leaflet.crossOrigin = "";
      leaflet.onerror = () => reject(new Error("Failed to load Leaflet"));
      leaflet.onload = () => {
        const mod = document.createElement("script");
        mod.src = "js/map.js";
        mod.onerror = () => reject(new Error("Failed to load map.js"));
        mod.onload = () => {
          state.mapLoaded = true;
          resolve();
        };
        document.body.appendChild(mod);
      };
      document.body.appendChild(leaflet);
    });
  }

  async function showMap(focusId) {
    try {
      await loadMapScript();
    } catch (err) {
      console.error(err);
      alert("Lo sentimos: no se pudo cargar el mapa. Revisa tu conexión.");
      return;
    }
    // map.js exposes window.PartyAtlasMap
    window.PartyAtlasMap.render(state.locations, { onMarkerActivate: openDetailById });

    els.galleryView.hidden = true;
    els.mapView.hidden = false;
    state.mapVisible = true;
    els.viewToggle.setAttribute("aria-pressed", "true");
    els.toggleLabel.textContent = "Ver galería";
    window.PartyAtlasMap.refresh(); // fix tile sizing after un-hide
    if (focusId) window.PartyAtlasMap.focus(focusId);
  }

  function showGallery() {
    els.mapView.hidden = true;
    els.galleryView.hidden = false;
    state.mapVisible = false;
    els.viewToggle.setAttribute("aria-pressed", "false");
    els.toggleLabel.textContent = "Ver mapa";
  }

  function openDetailById(id) {
    const loc = byId(id);
    if (loc) renderDetail(loc);
  }

  // --- Events --------------------------------------------------------------
  function wireEvents() {
    els.filterInput.addEventListener("input", (e) => {
      state.filter = e.target.value;
      renderGallery();
    });

    els.gallery.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (card) openDetailById(card.dataset.id);
    });

    els.viewToggle.addEventListener("click", () => {
      if (state.mapVisible) showGallery();
      else showMap();
    });

    // Detail dialog: close button, "show on map", and backdrop click.
    els.dialog.addEventListener("click", (e) => {
      if (e.target.matches("[data-close-detail]") || e.target === els.dialog) {
        els.dialog.close();
        return;
      }
      const mapBtn = e.target.closest("[data-show-on-map]");
      if (mapBtn) {
        els.dialog.close();
        showMap(mapBtn.dataset.showOnMap);
      }
    });
  }

  // --- Boot ----------------------------------------------------------------
  async function init() {
    wireEvents();
    try {
      const res = await fetch("data/locations.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.locations = await res.json();
    } catch (err) {
      console.error(err);
      els.gallery.innerHTML = "";
      els.emptyState.hidden = false;
      els.emptyState.textContent =
        "No se pudieron cargar las ubicaciones. Si abriste el archivo directamente, ejecuta un servidor local (consulta el README).";
      return;
    }
    renderGallery();
  }

  init();
})();
