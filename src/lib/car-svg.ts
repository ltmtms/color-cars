/** Kid-friendly side-view car outline — thick stroke for printing & OpenCV contours */
export const CAR_VIEWBOX = "0 0 400 220";

export function carOutlineSvg(options?: {
  strokeOnly?: boolean;
  fillColor?: string;
  strokeWidth?: number;
}) {
  const strokeOnly = options?.strokeOnly ?? true;
  const fill = strokeOnly ? "#ffffff" : (options?.fillColor ?? "#ff9ecd");
  const stroke = "#1a1a1a";
  const sw = options?.strokeWidth ?? 8;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CAR_VIEWBOX}" width="400" height="220">
  <rect width="100%" height="100%" fill="white"/>
  <g fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">
    <path d="M 45 145
      Q 40 120 55 105
      L 85 95
      Q 95 70 120 62
      L 155 58
      Q 175 35 210 32
      L 280 32
      Q 310 35 325 55
      L 340 62
      Q 355 70 360 88
      L 365 105
      Q 375 115 378 130
      L 380 145
      Q 382 158 370 165
      L 55 165
      Q 42 162 45 145 Z"/>
    <circle cx="115" cy="165" r="28" fill="${strokeOnly ? "#ffffff" : fill}" stroke="${stroke}" stroke-width="${sw}"/>
    <circle cx="295" cy="165" r="28" fill="${strokeOnly ? "#ffffff" : fill}" stroke="${stroke}" stroke-width="${sw}"/>
    <path d="M 165 58 L 175 95 L 255 95 L 265 58 Z" fill="${strokeOnly ? "#ffffff" : options?.fillColor ?? "#a8d8ff"}" stroke="${stroke}" stroke-width="${Math.max(4, sw - 2)}"/>
    <circle cx="330" cy="78" r="10" fill="${strokeOnly ? "#ffffff" : "#fff5a0"}" stroke="${stroke}" stroke-width="4"/>
  </g>
</svg>`;
}
