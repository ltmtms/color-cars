import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-center">
      <p className="inline-block rounded-full bg-rose-100 text-rose-700 text-sm font-semibold px-4 py-1 mb-6">
        Warm · Cute · Rolling fun
      </p>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 leading-tight mb-4">
        Colour a car, scan it, and join the parade!
      </h1>
      <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
        Print a friendly car outline, let kids go wild with crayons, then use
        your phone camera to cut the car out with OpenCV and send it to the
        sunny showcase.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/print"
          className="rounded-2xl bg-white px-8 py-4 font-bold text-rose-600 shadow-lg ring-2 ring-rose-200 hover:bg-rose-50 transition"
        >
          1. Print templates
        </Link>
        <Link
          href="/scan"
          className="rounded-2xl bg-rose-500 px-8 py-4 font-bold text-white shadow-lg hover:bg-rose-600 transition"
        >
          2. Scan your car
        </Link>
        <Link
          href="/showcase"
          className="rounded-2xl bg-amber-400 px-8 py-4 font-bold text-amber-950 shadow-lg hover:bg-amber-300 transition"
        >
          3. Watch the parade
        </Link>
      </div>
      <ol className="mt-14 text-left text-slate-600 space-y-3 max-w-md mx-auto text-sm">
        <li>
          <strong className="text-slate-800">Print</strong> — thick black lines
          on A4 paper (plus a QR to scan).
        </li>
        <li>
          <strong className="text-slate-800">Colour</strong> — markers, crayons,
          stickers — go nuts!
        </li>
        <li>
          <strong className="text-slate-800">Scan</strong> — OpenCV finds the
          outline and keeps your colours.
        </li>
        <li>
          <strong className="text-slate-800">Showcase</strong> — every car
          bounces and rolls together.
        </li>
      </ol>
    </div>
  );
}
