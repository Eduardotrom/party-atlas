# The Party Atlas (El Atlas del Grupo)

A simple, fast, image-led webpage that lists our D&D party's real-world haunts —
each given a **fantasy nickname** — as a gallery of cards, with an optional
interactive map and one-tap navigation links (Google Maps / Waze / Uber).

No build step, no framework. Just HTML, CSS, and a little vanilla JavaScript.

> **Note on language:** the *site content* (location names, lore) is in **Spanish**
> because it's for the party. This documentation is in **English** for maintenance.

- **Live site:** https://eduardotrom.github.io/party-atlas/
- **Repo:** https://github.com/Eduardotrom/party-atlas

## Run it locally

The page loads its data with `fetch()`, which browsers block on `file://` URLs, so
open it through a tiny local server rather than double-clicking `index.html`:

```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

(Any static server works — e.g. `npx serve`.)

## Add or edit locations

Everything lives in **`data/locations.json`** — an array of location objects. Add an
entry and the gallery/map pick it up automatically (entries are **sorted
alphabetically** by nickname at render time, ignoring leading articles El/La/Los/Las).

```json
{
  "id": "la-boveda-del-goblin",
  "nickname": "La Bóveda del Goblin",
  "realName": "Pregunta al DM",
  "address": "Los Jardines de Coyoacán, Coyoacán, 04890, Ciudad de México",
  "coordinates": { "lat": 19.3133, "lng": -99.124061 },
  "category": "bóveda",
  "image": "images/la-boveda-del-goblin.svg",
  "imageAlt": "Short description of the image for screen readers",
  "lore": "Flavorful in-world description.",
  "tags": ["compras", "tesoro"]
}
```

| Field         | Required | Notes                                                              |
| ------------- | -------- | ------------------------------------------------------------------ |
| `id`          | yes      | URL-safe slug, unique. Also used as the image base name.           |
| `nickname`    | yes      | Fantasy name shown as the card title; the sort key.                |
| `realName`    | no       | Real place name (shown smaller). We use playful hints here.        |
| `address`     | yes      | Address shown in the detail view (often colonia-level on purpose). |
| `coordinates` | for map  | `{ "lat": ..., "lng": ... }`. Needed for a map pin + nav links.    |
| `category`    | yes      | Drives the badge (e.g. taberna, mercado, templo, santuario…).      |
| `image`       | yes      | Path to a hero image under `images/`.                              |
| `imageAlt`    | yes      | Accessibility description of the image.                            |
| `lore`        | no       | In-world flavor text.                                              |
| `tags`        | no       | Array of strings; searchable from the search box.                  |

**Images:** seed entries ship as lightweight SVG placeholders (an emoji + label on a
themed gradient). To make one, copy an existing `images/*.svg`, change the gradient
colors, emoji, and label, then point the entry's `image` at it. Real photos/art work
too — just drop the file in `images/`.

**If you rename a location:** update `nickname`, and for consistency also rename its
`id` and its image file (and the `image` path). Use `git mv` for the image so history
is preserved.

## Getting coordinates from a Google Maps link

The fastest way to fill `coordinates` (and an approximate address):

1. Drop a pin in Google Maps and grab the **share link** (e.g.
   `https://maps.app.goo.gl/...`).
2. Expand the short link to reveal the coordinates it encodes:
   ```bash
   curl -s -o /dev/null -w '%{url_effective}\n' -L "https://maps.app.goo.gl/XXXX"
   # -> .../maps/search/19.3133,+-99.124061?...   (lat, lng)
   ```
3. (Optional) Reverse-geocode the coordinates to a human address with OpenStreetMap
   (free, no key):
   ```bash
   curl -s "https://nominatim.openstreetmap.org/reverse?lat=19.3133&lon=-99.124061&format=jsonv2&accept-language=es" \
     -H "User-Agent: party-atlas/1.0"
   ```

> **Privacy:** the pins in this project are deliberately **approximate** (placed
> near, not on, the real address) because the site is public. Keep addresses at
> colonia level for homes.

## Features / how it works

| File                  | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `index.html`          | Page shell: gallery, map container, search, view toggle, detail dialog. |
| `css/styles.css`      | Base layout + fantasy theme (parchment, gold, Cinzel display font).  |
| `js/app.js`           | Fetches + sorts the JSON, renders the gallery, search, detail dialog, and the nav buttons. |
| `js/map.js`           | Leaflet map; **loaded lazily** only when the map is first opened.    |
| `data/locations.json` | The location list — the file you edit.                               |
| `images/`             | Hero images (seed entries are SVG placeholders).                     |

- **Gallery-first**, responsive card grid; click a card for a detail dialog.
- **Search** box filters by name, lore, category, or tag (live).
- **Map toggle** reveals an interactive Leaflet + OpenStreetMap map (free, no API
  key). Both Leaflet and `map.js` load only when the map is opened, so the gallery
  stays fast. A "Volver a la galería" button returns to the list.
- **Navigation buttons** in each detail view, built from the coordinates:
  - **Ver en Maps** — Google Maps place view (`/maps/search/?api=1&query=lat,lng`)
  - **Waze** — `https://waze.com/ul?ll=lat,lng&navigate=yes`
  - **Uber** — Uber universal deep link with the destination preloaded

  These are universal links: on mobile they open the native app; on desktop, the web.
- **Alphabetical sort** by nickname, ignoring leading articles (El/La/Los/Las).

## Cache-busting

`index.html` references the assets with a version query, e.g. `styles.css?v=3` and
`app.js?v=5`. **When you change `css/styles.css` or `js/app.js`, bump that number**
(and the `map.js?v=N` inside `app.js`) so returning visitors fetch the new version
instead of a cached one. `data/locations.json` is fetched with `cache: "no-cache"`,
so data edits need no bump.

## Deploy (GitHub Pages)

Already configured. To re-enable from scratch: repo **Settings → Pages →** Source =
*Deploy from a branch*, Branch = `main`, folder = `/ (root)`. The `.nojekyll` file
makes Pages serve everything as-is. Every push to `main` redeploys in ~1 minute.

### Branch protection

`main` is protected: changes require a **Pull Request**. The repo **admin (owner)**
can bypass and push directly (`enforce_admins = false`); force-pushes and branch
deletion are blocked. External contributors can only propose changes via a fork + PR.

## Ideas for later

- Apple Maps link for iPhone users (one more button in the detail row).
- A fantasy-styled map (Mapbox/MapTiler custom tiles) instead of plain OSM.
- Self-host the display font in `fonts/` for full offline use.
