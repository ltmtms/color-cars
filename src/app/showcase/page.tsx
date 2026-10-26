import { ShowcaseScene } from "@/components/ShowcaseScene";
import Link from "next/link";

export default function ShowcasePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-2">
          Car parade showcase
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Demo cars plus scans saved in this browser bounce along the sunny road.
          Open showcase on the big screen in the same browser session, or scan at{" "}
          <Link href="/scan" className="text-rose-600 font-semibold underline">
            /scan
          </Link>
          .
        </p>
      </div>
      <ShowcaseScene />
      <p className="text-center text-xs text-slate-500 mt-4">
        Updates every 2 seconds and when new scans are saved in this browser.
      </p>
    </div>
  );
}
