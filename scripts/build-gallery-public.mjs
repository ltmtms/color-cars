import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.join(root, "..");
const dataDir = path.join(repo, "data");
const outDir = path.join(repo, "public", "gallery", "demo");

async function main() {
  const indexPath = path.join(dataDir, "cars.json");
  let index = { cars: [] };
  try {
    index = JSON.parse(await fs.readFile(indexPath, "utf-8"));
  } catch {
    console.warn("No data/cars.json — run npm run seed first");
    return;
  }

  await fs.mkdir(outDir, { recursive: true });
  const manifestCars = [];

  for (const car of index.cars) {
    const src = path.join(dataDir, "images", car.filename);
    try {
      await fs.access(src);
    } catch {
      continue;
    }
    const destName = `${car.id}.png`;
    await fs.copyFile(src, path.join(outDir, destName));
    manifestCars.push({
      id: car.id,
      imageUrl: `/gallery/demo/${destName}`,
      displayName: car.displayName,
      createdAt: car.createdAt,
      demo: car.demo ?? false,
    });
  }

  const manifest = { cars: manifestCars };
  await fs.writeFile(
    path.join(repo, "public", "gallery", "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );
  console.log(`Gallery manifest: ${manifestCars.length} demo cars in public/gallery/`);
}

main();
