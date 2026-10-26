/** API base for static GitHub Pages vs same-origin Next deploy */
export function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
