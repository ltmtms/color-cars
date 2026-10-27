/** Pure canvas car cutout — no OpenCV / WASM / CDN. */

function isPaper(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const sat = max === 0 ? 0 : (max - min) / max;
  return lum > 0.82 && sat < 0.12;
}

function scaleToCanvas(
  source: HTMLCanvasElement,
  maxEdge: number
): HTMLCanvasElement {
  const scale =
    Math.max(source.width, source.height) > maxEdge
      ? maxEdge / Math.max(source.width, source.height)
      : 1;
  const work = document.createElement("canvas");
  work.width = Math.max(1, Math.round(source.width * scale));
  work.height = Math.max(1, Math.round(source.height * scale));
  const ctx = work.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(source, 0, 0, work.width, work.height);
  return work;
}

/** Largest connected region of non-paper pixels (4-neighbour flood fill). */
function largestForegroundMask(
  width: number,
  height: number,
  paper: Uint8Array
): Uint8Array {
  const visited = new Uint8Array(width * height);
  const best = new Uint8Array(width * height);
  let bestSize = 0;
  const minArea = width * height * 0.015;
  const stack: number[] = [];

  for (let i = 0; i < width * height; i++) {
    if (paper[i] || visited[i]) continue;
    stack.length = 0;
    stack.push(i);
    visited[i] = 1;
    const component: number[] = [i];
    let head = 0;

    while (head < stack.length) {
      const idx = stack[head++];
      const x = idx % width;
      const y = (idx / width) | 0;
      const neighbours = [
        x > 0 ? idx - 1 : -1,
        x < width - 1 ? idx + 1 : -1,
        y > 0 ? idx - width : -1,
        y < height - 1 ? idx + width : -1,
      ];
      for (const n of neighbours) {
        if (n < 0 || paper[n] || visited[n]) continue;
        visited[n] = 1;
        stack.push(n);
        component.push(n);
      }
    }

    if (component.length > bestSize && component.length >= minArea) {
      bestSize = component.length;
      best.fill(0);
      for (const idx of component) best[idx] = 1;
    }
  }

  return best;
}

/** Shrink mask by one pixel to trim paper fringe. */
function erodeMask(mask: Uint8Array, width: number, height: number): Uint8Array {
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!mask[i]) continue;
      let keep = true;
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
          keep = false;
          break;
        }
        if (!mask[ny * width + nx]) {
          keep = false;
          break;
        }
      }
      if (keep) out[i] = 1;
    }
  }
  return out;
}

export function extractCarFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  maxEdge = 1000
): HTMLCanvasElement {
  const work = scaleToCanvas(sourceCanvas, maxEdge);
  const w = work.width;
  const h = work.height;
  const ctx = work.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const { data } = ctx.getImageData(0, 0, w, h);

  const paper = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    paper[i] = isPaper(data[o], data[o + 1], data[o + 2]) ? 1 : 0;
  }

  let mask = largestForegroundMask(w, h, paper);
  if (mask.every((v) => v === 0)) {
    throw new Error(
      "Could not find your car — use brighter light and fill the frame with the paper."
    );
  }
  mask = erodeMask(mask, w, h);

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const outCtx = out.getContext("2d");
  if (!outCtx) throw new Error("Canvas unavailable");
  const outImg = outCtx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    if (mask[i]) {
      outImg.data[o] = data[o];
      outImg.data[o + 1] = data[o + 1];
      outImg.data[o + 2] = data[o + 2];
      outImg.data[o + 3] = 255;
    }
  }
  outCtx.putImageData(outImg, 0, 0);
  return out;
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode PNG"))),
      "image/png"
    );
  });
}
