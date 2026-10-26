/* Client-side car cutout using OpenCV.js — finds dark outline on white paper */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type OpenCVModule = any;

let loadPromise: Promise<OpenCVModule> | null = null;

export function loadOpenCV(): Promise<OpenCVModule> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("OpenCV runs in the browser only"));
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-opencv="true"]'
    ) as HTMLScriptElement | null;
    if (existing && (window as unknown as { cv?: OpenCVModule }).cv) {
      const c = (window as unknown as { cv: OpenCVModule }).cv;
      if (c.Mat) {
        resolve(c);
        return;
      }
    }

    const script = document.createElement("script");
    script.src = "https://docs.opencv.org/4.9.0/opencv.js";
    script.async = true;
    script.dataset.opencv = "true";
    script.onload = () => {
      const c = (window as unknown as { cv: OpenCVModule }).cv;
      c.onRuntimeInitialized = () => resolve(c);
    };
    script.onerror = () => reject(new Error("Failed to load OpenCV.js"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Extract coloured car from photo: threshold dark ink → largest contour → alpha mask.
 */
export async function extractCarFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  maxEdge = 1200
): Promise<HTMLCanvasElement> {
  const cv = await loadOpenCV();

  const work = document.createElement("canvas");
  const scale =
    Math.max(sourceCanvas.width, sourceCanvas.height) > maxEdge
      ? maxEdge / Math.max(sourceCanvas.width, sourceCanvas.height)
      : 1;
  work.width = Math.round(sourceCanvas.width * scale);
  work.height = Math.round(sourceCanvas.height * scale);
  const wctx = work.getContext("2d");
  if (!wctx) throw new Error("Canvas unavailable");
  wctx.drawImage(sourceCanvas, 0, 0, work.width, work.height);

  const src = cv.imread(work);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const binary = new cv.Mat();
  const closed = new cv.Mat();
  const kernel = cv.getStructuringElement(
    cv.MORPH_ELLIPSE,
    new cv.Size(9, 9)
  );

  try {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    cv.threshold(blurred, binary, 210, 255, cv.THRESH_BINARY_INV);
    cv.morphologyEx(binary, closed, cv.MORPH_CLOSE, kernel);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      closed,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    let maxArea = 0;
    let maxIdx = -1;
    const minArea = work.width * work.height * 0.02;
    for (let i = 0; i < contours.size(); i++) {
      const area = cv.contourArea(contours.get(i));
      if (area > maxArea && area > minArea) {
        maxArea = area;
        maxIdx = i;
      }
    }

    const mask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
    if (maxIdx >= 0) {
      const one = new cv.MatVector();
      one.push_back(contours.get(maxIdx));
      cv.drawContours(mask, one, 0, new cv.Scalar(255, 255, 255, 255), -1);
      one.delete();
      const erodeK = cv.getStructuringElement(
        cv.MORPH_ELLIPSE,
        new cv.Size(5, 5)
      );
      cv.erode(mask, mask, erodeK);
      erodeK.delete();
    }

    const channels = new cv.MatVector();
    cv.split(src, channels);
    channels.set(3, mask);
    const dst = new cv.Mat();
    cv.merge(channels, dst);

    const out = document.createElement("canvas");
    out.width = work.width;
    out.height = work.height;
    cv.imshow(out, dst);

    dst.delete();
    channels.delete();
    return out;
  } finally {
    src.delete();
    gray.delete();
    blurred.delete();
    binary.delete();
    closed.delete();
    kernel.delete();
  }
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode PNG"))),
      "image/png"
    );
  });
}
