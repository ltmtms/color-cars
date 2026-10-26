import { NextResponse } from "next/server";
import { listCars, readCarImage } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const cars = await listCars();
  const record = cars.find((c) => c.id === id);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const buf = await readCarImage(record);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
