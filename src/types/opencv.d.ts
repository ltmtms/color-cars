declare global {
  // eslint-disable-next-line no-var
  var cv: {
    onRuntimeInitialized: () => void;
    Mat: {
      delete(): void;
      rows: number;
      cols: number;
      zeros(rows: number, cols: number, type: number): {
        delete(): void;
        rows: number;
        cols: number;
      };
    };
    MatVector: new () => {
      size(): number;
      get(i: number): { delete(): void };
      push_back(m: unknown): void;
      delete(): void;
    };
    Size: new (w: number, h: number) => unknown;
    Scalar: new (a: number, b?: number, c?: number, d?: number) => unknown;
    imread(canvas: HTMLCanvasElement): { delete(): void; rows: number; cols: number };
    imshow(canvas: HTMLCanvasElement, mat: unknown): void;
    cvtColor(src: unknown, dst: unknown, code: number): void;
    GaussianBlur(src: unknown, dst: unknown, ksize: unknown, sigma: number): void;
    threshold(src: unknown, dst: unknown, thresh: number, maxval: number, type: number): void;
    morphologyEx(src: unknown, dst: unknown, op: number, kernel: unknown): void;
    getStructuringElement(shape: number, size: unknown): { delete(): void };
    findContours(
      image: unknown,
      contours: unknown,
      hierarchy: unknown,
      mode: number,
      method: number
    ): void;
    contourArea(contour: unknown): number;
    drawContours(
      image: unknown,
      contours: unknown,
      contourIdx: number,
      color: unknown,
      thickness: number
    ): void;
    erode(src: unknown, dst: unknown, kernel: unknown): void;
    split(src: unknown, mv: unknown): void;
    merge(mv: unknown, dst: unknown): void;
    COLOR_RGBA2GRAY: number;
    THRESH_BINARY_INV: number;
    MORPH_CLOSE: number;
    MORPH_ELLIPSE: number;
    RETR_EXTERNAL: number;
    CHAIN_APPROX_SIMPLE: number;
    CV_8UC1: number;
  };
}

export {};
