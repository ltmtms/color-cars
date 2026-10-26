import { NextRequest, NextResponse } from "next/server";
import { addCar, listCars } from "@/lib/storage";

export async function GET() {
  const cars = await listCars();
  return NextResponse.json({
    cars: cars.map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
      displayName: c.displayName,
      demo: c.demo,
      imageUrl: `/api/cars/${c.id}/image`,
    })),
  });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("image");
  const displayName = form.get("displayName");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });
  }

  const record = await addCar(buf, {
    displayName:
      typeof displayName === "string" && displayName.trim()
        ? displayName.trim().slice(0, 40)
        : undefined,
  });

  return NextResponse.json({
    id: record.id,
    imageUrl: `/api/cars/${record.id}/image`,
  });
}
