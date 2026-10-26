import Link from "next/link";

const links = [
  { href: "/print", label: "Print" },
  { href: "/scan", label: "Scan" },
  { href: "/showcase", label: "Showcase" },
];

export function SiteNav() {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-3 px-4"
      aria-label="Main"
    >
      <Link
        href="/"
        className="font-display text-lg font-bold text-rose-600 mr-2"
      >
        Colour-a-Car
      </Link>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-rose-100 hover:bg-rose-50 hover:text-rose-700 transition"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
