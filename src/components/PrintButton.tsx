"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-6 rounded-full bg-rose-500 text-white font-bold px-8 py-3 shadow-md hover:bg-rose-600"
    >
      Print this page
    </button>
  );
}
