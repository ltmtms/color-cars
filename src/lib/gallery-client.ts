/** Browser gallery: static demo manifest + local scans (GitHub Pages has no API). */

export type GalleryCar = {
  id: string;
  imageUrl: string;
  displayName?: string;
  createdAt: string;
  demo?: boolean;
};

const STORAGE_KEY = "color-cars-gallery-v1";
export const GALLERY_UPDATE_EVENT = "color-cars-gallery-update";

export function publicBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

export function assetUrl(path: string): string {
  const base = publicBasePath();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function loadLocal(): GalleryCar[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GalleryCar[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(cars: GalleryCar[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars.slice(-40)));
}

async function loadSeedManifest(): Promise<GalleryCar[]> {
  const res = await fetch(assetUrl("/gallery/manifest.json"));
  if (!res.ok) return [];
  const data = (await res.json()) as { cars: GalleryCar[] };
  return (data.cars ?? []).map((c) => ({
    ...c,
    imageUrl: assetUrl(c.imageUrl.startsWith("/") ? c.imageUrl : `/${c.imageUrl}`),
  }));
}

export async function listGalleryCars(): Promise<GalleryCar[]> {
  const seeds = await loadSeedManifest();
  const local = loadLocal();
  const byId = new Map<string, GalleryCar>();
  for (const c of seeds) byId.set(c.id, c);
  for (const c of local) byId.set(c.id, c);
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read image"));
    r.readAsDataURL(blob);
  });
}

export async function addGalleryCar(
  blob: Blob,
  displayName?: string
): Promise<GalleryCar> {
  const car: GalleryCar = {
    id: crypto.randomUUID(),
    imageUrl: await blobToDataUrl(blob),
    displayName: displayName?.trim().slice(0, 40) || undefined,
    createdAt: new Date().toISOString(),
  };
  const local = loadLocal();
  local.push(car);
  saveLocal(local);
  window.dispatchEvent(new Event(GALLERY_UPDATE_EVENT));
  return car;
}
