import fs from "fs/promises";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { carOutlineSvg } from "./car-svg";
import { INDEX_PATH, IMAGES_DIR, DATA_DIR } from "./paths";
import type { CarsIndex } from "./types";

const SEED_COLORS = [
  { body: "#ff9ecd", window: "#b8f0ff", headlight: "#fff5a0" },
  { body: "#9ee6b4", window: "#d4c4ff", headlight: "#ffe49e" },
  { body: "#ffb38a", window: "#a8d8ff", headlight: "#fff0a8" },
  { body: "#c4b5fd", window: "#ffd6e8", headlight: "#fff9c4" },
  { body: "#7dd3fc", window: "#fecdd3", headlight: "#fef08a" },
  { body: "#fda4af", window: "#bbf7d0", headlight: "#fde68a" },
];

let seeding: Promise<void> | null = null;

export async function ensureSeedCars() {
  if (!seeding) seeding = seedOnce();
  await seeding;
}

async function seedOnce() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  try {
    await fs.access(INDEX_PATH);
    const raw = await fs.readFile(INDEX_PATH, "utf-8");
    const index = JSON.parse(raw) as CarsIndex;
    if (index.cars.length > 0) return;
  } catch {
    /* no index yet */
  }

  const cars: CarsIndex["cars"] = [];
  const names = ["Sunny", "Bubbles", "Zoom", "Peach", "Sky", "Berry"];

  for (let i = 0; i < SEED_COLORS.length; i++) {
    const c = SEED_COLORS[i];
    const svg = carOutlineSvg({
      strokeOnly: false,
      fillColor: c.body,
      strokeWidth: 8,
    }).replace(
      `fill="${c.body}"`,
      `fill="${c.body}"`
    );
    const colored = svg
      .replace(
        'fill="#a8d8ff"',
        `fill="${c.window}"`
      )
      .replace(
        'fill="#fff5a0"',
        `fill="${c.headlight}"`
      );

    const id = randomUUID();
    const filename = `${id}.png`;
    const png = await sharp(Buffer.from(colored))
      .resize(800, 440, { fit: "contain", background: "#ffffff" })
      .png()
      .toBuffer();

    await fs.writeFile(`${IMAGES_DIR}/${filename}`, png);
    cars.push({
      id,
      filename,
      createdAt: new Date(Date.now() - (SEED_COLORS.length - i) * 60000).toISOString(),
      displayName: names[i],
      demo: true,
    });
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(INDEX_PATH, JSON.stringify({ cars }, null, 2), "utf-8");
}
