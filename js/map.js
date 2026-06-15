/* The Party Atlas — map module. Loaded lazily by app.js only when the map is
   first opened. Depends on Leaflet (window.L) being loaded first.
   Exposes window.PartyAtlasMap = { render, refresh, focus }. */
(() => {
  "use strict";

  let map = null;
  const markers = new Map(); // id -> L.Marker

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  function render(locations, { onMarkerActivate } = {}) {
    const withCoords = locations.filter(
      (l) => l.coordinates && Number.isFinite(l.coordinates.lat) && Number.isFinite(l.coordinates.lng)
    );

    if (!map) {
      map = L.map("map");
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    }

    // Clear any prior markers (e.g., after a data change) before re-plotting.
    markers.forEach((m) => map.removeLayer(m));
    markers.clear();

    const bounds = [];
    withCoords.forEach((loc) => {
      const latlng = [loc.coordinates.lat, loc.coordinates.lng];
      const marker = L.marker(latlng).addTo(map);
      marker.bindPopup(
        `<strong>${escapeHtml(loc.nickname)}</strong><br />` +
          `<button type="button" class="popup-detail" data-id="${escapeHtml(loc.id)}">View details</button>`
      );
      if (typeof onMarkerActivate === "function") {
        marker.on("popupopen", (e) => {
          const btn = e.popup.getElement().querySelector(".popup-detail");
          if (btn) btn.addEventListener("click", () => onMarkerActivate(loc.id), { once: true });
        });
      }
      markers.set(loc.id, marker);
      bounds.push(latlng);
    });

    if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40] });
    else if (bounds.length === 1) map.setView(bounds[0], 14);
    else map.setView([20, 0], 2); // graceful empty-data fallback
  }

  // Leaflet miscalculates tile size if the container was hidden at init.
  function refresh() {
    if (map) setTimeout(() => map.invalidateSize(), 0);
  }

  function focus(id) {
    const marker = markers.get(id);
    if (!marker) return;
    map.setView(marker.getLatLng(), 15);
    marker.openPopup();
  }

  window.PartyAtlasMap = { render, refresh, focus };
})();
