import { PrintSheet } from "@/components/PrintSheet";

export default function PrintPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="no-print mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
          Printable car templates
        </h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          Print on white A4 paper. Use thick crayons inside the lines — the
          scanner loves bold colour! Each sheet includes a QR code to the scan
          page.
        </p>
        <p className="text-sm text-slate-500 mt-4">Use the pink button below the intro to print.</p>
      </div>
      <PrintSheet />
    </div>
  );
}
