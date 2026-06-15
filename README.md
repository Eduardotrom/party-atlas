# El Atlas del Grupo

Una página web sencilla, rápida y con mucha imagen que lista los lugares reales de
nuestro grupo de D&D —cada uno con su **apodo de fantasía**— como una galería de
tarjetas, con un mapa interactivo opcional.

Sin paso de compilación, sin framework. Solo HTML, CSS y un poco de JavaScript.

## Ejecutarlo localmente

La página carga sus datos con `fetch()`, lo que los navegadores bloquean en URLs
`file://`, así que ábrela a través de un pequeño servidor local en lugar de hacer
doble clic en `index.html`:

```bash
# desde esta carpeta
python3 -m http.server 8000
# luego abre http://localhost:8000 en tu navegador
```

(Cualquier servidor estático sirve — por ejemplo `npx serve` si prefieres Node.)

## Añadir o editar ubicaciones

Todo vive en **`data/locations.json`**. Añade un objeto al arreglo:

```json
{
  "id": "la-jarra-alegre",
  "nickname": "La Jarra Alegre",
  "realName": "Casa de Miguel",
  "address": "Av. Siempreviva 742, Springfield",
  "coordinates": { "lat": 40.7128, "lng": -74.006 },
  "category": "taberna",
  "image": "images/la-jarra-alegre.svg",
  "imageAlt": "Descripción breve de la imagen para lectores de pantalla",
  "lore": "Una descripción con sabor a fantasía.",
  "tags": ["punto-de-encuentro", "comida"]
}
```

| Campo         | ¿Obligatorio? | Notas                                                          |
| ------------- | ------------- | -------------------------------------------------------------- |
| `id`          | sí            | Slug único y apto para URL. También es el nombre base de la imagen. |
| `nickname`    | sí            | Nombre de fantasía mostrado como título de la tarjeta.         |
| `realName`    | no            | El nombre real del lugar (se muestra más pequeño).             |
| `address`     | sí            | Dirección real, mostrada en el detalle.                        |
| `coordinates` | para el mapa  | `{ "lat": ..., "lng": ... }`. Necesario para colocar el marcador. |
| `category`    | sí            | Define la insignia (taberna, fortaleza, mercado, bosque, forja…). |
| `image`       | sí            | Ruta a una imagen destacada dentro de `images/`.               |
| `imageAlt`    | sí            | Descripción accesible de la imagen.                            |
| `lore`        | no            | Texto de ambientación dentro del mundo.                        |
| `tags`        | no            | Arreglo de cadenas; se pueden buscar.                          |

**Imágenes:** coloca un archivo en `images/` y apunta `image` hacia él. Las entradas
de ejemplo usan marcadores SVG ligeros — reemplázalos por fotos o arte real cuando
quieras.

**Coordenadas:** si solo tienes la dirección, búscala (por ejemplo, haz clic derecho
en un punto de Google Maps → la lat/lng aparece arriba) y pega los números.

## Publicar (GitHub Pages)

1. El repositorio público ya existe: https://github.com/Eduardotrom/party-atlas
2. En **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main`,
   carpeta = `/ (root)`. (Ya está activado.)
3. El sitio en vivo: **https://eduardotrom.github.io/party-atlas/**

Cada `push` a `main` vuelve a desplegar el sitio en aproximadamente un minuto.
El archivo `.nojekyll` ya está incluido para que Pages sirva todo tal cual.

## Cómo está construido

| Archivo               | Propósito                                                          |
| --------------------- | ----------------------------------------------------------------- |
| `index.html`          | Estructura: galería, contenedor del mapa, búsqueda y botón.       |
| `css/styles.css`      | Maquetación base + tema de fantasía (pergamino, oro, fuente).     |
| `js/app.js`           | Carga el JSON, renderiza la galería, la búsqueda y el detalle.    |
| `js/map.js`           | Mapa Leaflet; **se carga solo al abrir el mapa por primera vez.** |
| `data/locations.json` | La lista de ubicaciones — el archivo que editas.                  |
| `images/`             | Imágenes destacadas (las de ejemplo son marcadores SVG).          |

El mapa usa [Leaflet](https://leafletjs.com/) + teselas de OpenStreetMap (gratis, sin
clave de API). Tanto Leaflet como `map.js` se cargan de forma diferida, por lo que la
galería se mantiene rápida y el mapa no cuesta nada hasta que lo activas.

## Ideas para más adelante

- Un mapa con estilo de fantasía (teselas personalizadas de Mapbox/MapTiler) en lugar
  del OSM estándar.
- Alojar la fuente decorativa en `fonts/` para un uso totalmente sin conexión.
