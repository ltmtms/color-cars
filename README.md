# Colour-a-Car

A warm, kid-friendly web activity: **print** a car outline, **colour** it on paper, **scan** it with a phone camera (OpenCV.js cuts the car out), and watch every car join a **bouncing parade** on the showcase screen.

## Live demo

After deploy, the app is served over **HTTPS** (required for camera access):

- **Primary (full app + API):** Vercel — see repo **Deployments** or the URL in the project README badge once linked.
- **GitHub Pages (optional UI mirror):** `https://ltmtms.github.io/color-cars/` — static pages talk to the Vercel API when `NEXT_PUBLIC_API_BASE` is set in the Pages build.

## Routes

| Route | Purpose |
|--------|---------|
| `/` | Home — quick start |
| `/print` | A4-friendly car templates + QR to scan |
| `/scan` | Camera / photo upload → OpenCV extraction → submit |
| `/showcase` | Sunny scene; all cars bounce and steer; polls every 4s |
| `GET /api/cars` | JSON list of cars |
| `POST /api/cars` | `multipart/form-data` with `image` (PNG) |
| `GET /api/cars/:id/image` | PNG cutout |

## How extraction works

1. A frame is captured from the camera (or an uploaded photo).
2. [OpenCV.js](https://docs.opencv.org/4.x/opencv.js) loads in the browser.
3. The image is scaled, converted to grayscale, and thresholded so **dark ink** (the printed outline + kid colouring) separates from **white paper**.
4. Morphological close + **largest external contour** ≈ the car silhouette.
5. That contour becomes an **alpha mask**; the background is transparent PNG.
6. You preview the cutout, then POST it to the gallery API.

## Run locally

```bash
npm install
npm run seed    # demo cars in data/ (also runs before build)
npm run dev     # http://localhost:3000
```

Open **Print** → print on A4 → colour → **Scan** on a phone on the same network (or use upload) → **Showcase** on a projector.

Camera needs a secure context (`https://` or `localhost`).

## Production persistence

- **Local / Node:** PNG files in `data/images/` and `data/cars.json`.
- **Vercel:** set `GITHUB_TOKEN` (repo scope) and `GITHUB_REPOSITORY=ltmtms/color-cars` so new scans are committed via the GitHub API and survive serverless restarts.

## Classroom flow (Stephen-style demo)

1. Open **Showcase** on the big screen.
2. Hand out printed sheets from **Print**.
3. Kids colour, then open **Scan** on phones (QR on the printout).
4. Confirm the cutout → **Send to parade** — cars appear on the showcase within a few seconds.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, OpenCV.js, `sharp` for seed assets, optional GitHub-backed storage on Vercel.
