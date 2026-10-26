# Colour-a-Car

Kids **print** a car outline, **colour** it, **scan** with OpenCV in the browser, and watch cars join a **bouncing parade** on the showcase.

## Live (GitHub Pages)

**https://ltmtms.github.io/color-cars/**

| Route | Purpose |
|--------|---------|
| `/color-cars/` | Home |
| `/color-cars/print/` | A4 templates + QR |
| `/color-cars/scan/` | Camera / upload → OpenCV cutout |
| `/color-cars/showcase/` | Animated parade |

HTTPS is provided by GitHub Pages (required for camera access).

## Gallery on Pages

There is no Node server on GitHub Pages. The parade uses:

- **Demo cars** — bundled under `public/gallery/` (from `data/` at build time)
- **New scans** — saved in this browser’s `localStorage` (showcase on the same device/browser sees them; demo cars appear for everyone)

OpenCV.js still runs fully in the browser for extraction.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (no `/color-cars` prefix locally).

## Build like CI (static export)

```bash
npm run build:pages
```

Output in `out/` with `basePath` `/color-cars`.

## Deploy

Pushes to `main` run `.github/workflows/deploy-pages.yml` (same pattern as [find-the-cat](https://github.com/ltmtms/find-the-cat)).

## Classroom flow

1. Open **Showcase** on the display (same browser you’ll scan from, or enjoy the six demo cars).
2. **Print** sheets for kids.
3. **Scan** on phone/laptop → confirm cutout → **Send to parade**.
