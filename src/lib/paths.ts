import path from "path";
import fs from "fs";

const bundledData = path.join(process.cwd(), "data");

/** Writable data dir: /tmp on Vercel, repo `data/` locally */
export const DATA_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", "color-cars-data")
    : bundledData;

export const IMAGES_DIR = path.join(DATA_DIR, "images");
export const INDEX_PATH = path.join(DATA_DIR, "cars.json");

export const BUNDLED_DATA_DIR = bundledData;

let bootstrapped = false;

/** Copy seeded gallery from the deployment bundle into /tmp once per instance */
export async function ensureWritableDataBootstrapped() {
  if (process.env.VERCEL !== "1" || bootstrapped) return;
  bootstrapped = true;
  const { mkdir, access, cp } = await import("fs/promises");
  try {
    await access(INDEX_PATH);
    return;
  } catch {
    /* need bootstrap */
  }
  if (!fs.existsSync(BUNDLED_DATA_DIR)) return;
  await mkdir(DATA_DIR, { recursive: true });
  await cp(BUNDLED_DATA_DIR, DATA_DIR, { recursive: true });
}
