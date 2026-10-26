import { carOutlineSvg } from "@/lib/car-svg";
import { ScanQr } from "@/components/ScanQr";
import { PrintButton } from "@/components/PrintButton";

export function PrintSheet() {
  const template = carOutlineSvg({ strokeOnly: true, strokeWidth: 10 });

  return (
    <>
      <div className="no-print flex justify-center mb-6">
        <PrintButton />
      </div>
      <div className="print-page bg-white shadow-xl rounded-2xl p-8 mb-12 print:shadow-none print:rounded-none print:p-0 print:mb-0 break-after-page">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-b border-dashed border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Car colouring sheet</h2>
            <p className="text-sm text-slate-500">Colour inside the lines, then scan me!</p>
          </div>
          <div className="flex items-center gap-3">
            <ScanQr />
            <p className="text-xs text-slate-500 max-w-[8rem]">
              Scan to open the camera page on your phone.
            </p>
          </div>
        </div>
        <div
          className="mx-auto max-w-2xl"
          dangerouslySetInnerHTML={{ __html: template }}
        />
        <p className="text-center text-xs text-slate-400 mt-4">
          colour-a-car · cut along nothing — just colour!
        </p>
      </div>
      <div className="print-page bg-white shadow-xl rounded-2xl p-8 print:shadow-none print:rounded-none print:p-0 break-after-page">
        <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">
          Bonus: smaller car (two per sheet idea)
        </h2>
        <div
          className="mx-auto max-w-md scale-90"
          dangerouslySetInnerHTML={{ __html: template }}
        />
      </div>
    </>
  );
}
