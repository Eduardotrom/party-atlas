# The Party Atlas

A simple, fast, image-led webpage that lists our D&D party's real-world haunts —
each given a **fantasy nickname** — as a gallery of cards, with an optional
interactive map.

No build step, no framework. Just HTML, CSS, and a little vanilla JavaScript.

## Run it locally

The page loads its data with `fetch()`, which browsers block on `file://` URLs,
so open it through a tiny local server rather than double-clicking `index.html`:

```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

(Any static server works — e.g. `npx serve` if you prefer Node.)

## Add or edit locations

Everything lives in **`data/locations.json`**. Add an object to the array:

```json
{
  "id": "the-tipsy-tankard",
  "nickname": "The Tipsy Tankard",
  "realName": "Mike's Place",
  "address": "742 Evergreen Terrace, Springfield",
  "coordinates": { "lat": 40.7128, "lng": -74.006 },
  "category": "tavern",
  "image": "images/the-tipsy-tankard.svg",
  "imageAlt": "Short description of the image for screen readers",
  "lore": "A flavorful in-world description.",
  "tags": ["meeting-point", "food"]
}
```

| Field         | Required | Notes                                                        |
| ------------- | -------- | ------------------------------------------------------------ |
| `id`          | yes      | URL-safe slug, unique. Also used as the image base name.     |
| `nickname`    | yes      | Fantasy name shown as the card title.                        |
| `realName`    | no       | The real place name (shown smaller).                         |
| `address`     | yes      | Real-world address, shown in the detail view.                |
| `coordinates` | for map  | `{ "lat": ..., "lng": ... }`. Needed to place a map marker.  |
| `category`    | yes      | Drives the badge (e.g. tavern, keep, market, wilds, forge).  |
| `image`       | yes      | Path to a hero image under `images/`.                        |
| `imageAlt`    | yes      | Accessibility description of the image.                      |
| `lore`        | no       | In-world flavor text.                                        |
| `tags`        | no       | Array of strings; searchable.                                |

**Images:** drop a file in `images/` and point `image` at it. The seed entries use
lightweight SVG placeholders — replace them with real photos or art any time.

**Coordinates:** if you only have an address, look it up (e.g. right-click a spot in
Google Maps → the lat/lng is at the top) and paste the numbers in.

## Deploy (GitHub Pages)

1. Create a public GitHub repo and push this folder.
2. Repo **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*,
   Branch = `main`, folder = `/ (root)`.
3. Wait a minute, then visit the URL Pages gives you.

The `.nojekyll` file is already included so Pages serves everything as-is.

## How it's built

| File                  | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `index.html`          | Page shell: gallery container, map container, search, toggle.      |
| `css/styles.css`      | Base layout + fantasy theme (parchment, gold, display font).       |
| `js/app.js`           | Fetches the JSON, renders the gallery, search, and detail dialog.  |
| `js/map.js`           | Leaflet map; **loaded only when the map is first opened.**         |
| `data/locations.json` | The location list — the file you edit.                             |
| `images/`             | Hero images (seed entries ship as SVG placeholders).               |

The map uses [Leaflet](https://leafletjs.com/) + OpenStreetMap tiles (free, no API
key). Both Leaflet and `map.js` are loaded lazily, so the gallery stays fast and the
map costs nothing until you toggle it.

## Ideas for later

- A fantasy-styled map (Mapbox/MapTiler custom tiles) instead of plain OSM.
- Self-host the display font in `fonts/` for full offline use.
