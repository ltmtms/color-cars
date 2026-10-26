import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { CarRecord, CarsIndex } from "./types";
import {
  INDEX_PATH,
  IMAGES_DIR,
  ensureWritableDataBootstrapped,
} from "./paths";
import { ensureSeedCars } from "./seed-cars";
import {
  githubPersistEnabled,
  githubReadIndex,
  githubWriteIndex,
  githubWriteImage,
  githubReadImage,
} from "./github-persist";

async function ensureDirs() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
}

export async function readIndex(): Promise<CarsIndex> {
  if (githubPersistEnabled()) {
    const remote = await githubReadIndex();
    if (remote && remote.cars.length > 0) return remote;
  }
  await ensureWritableDataBootstrapped();
  await ensureDirs();
  await ensureSeedCars();
  try {
    const raw = await fs.readFile(INDEX_PATH, "utf-8");
    return JSON.parse(raw) as CarsIndex;
  } catch {
    return { cars: [] };
  }
}

export async function writeIndex(index: CarsIndex) {
  await ensureDirs();
  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), "utf-8");
}

export async function listCars(): Promise<CarRecord[]> {
  const index = await readIndex();
  return index.cars.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addCar(
  pngBuffer: Buffer,
  meta?: { displayName?: string }
): Promise<CarRecord> {
  await ensureWritableDataBootstrapped();
  await ensureDirs();
  const id = randomUUID();
  const filename = `${id}.png`;
  const filePath = path.join(IMAGES_DIR, filename);
  await fs.writeFile(filePath, pngBuffer);

  const record: CarRecord = {
    id,
    filename,
    createdAt: new Date().toISOString(),
    displayName: meta?.displayName,
  };

  const index = await readIndex();
  index.cars.push(record);
  await writeIndex(index);

  if (githubPersistEnabled()) {
    await githubWriteImage(filename, pngBuffer);
    await githubWriteIndex(index);
  }

  return record;
}

export function imagePathFor(record: CarRecord) {
  return path.join(IMAGES_DIR, record.filename);
}

export async function readCarImage(record: CarRecord): Promise<Buffer> {
  const remote = await githubReadImage(record);
  if (remote) return remote;
  return fs.readFile(imagePathFor(record));
}
