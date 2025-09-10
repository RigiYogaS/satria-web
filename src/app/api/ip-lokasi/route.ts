import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all IPs
export async function GET() {
  const data = await prisma.ipLokasi.findMany();
  return NextResponse.json(data);
}

// POST: Add new IP
export async function POST(request: NextRequest) {
  const { ip, nama_wifi } = await request.json();
  if (!ip || !nama_wifi) {
    return NextResponse.json(
      { error: "IP dan nama wifi wajib diisi" },
      { status: 400 }
    );
  }
  try {
    const created = await prisma.ipLokasi.create({ data: { ip, nama_wifi } });
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: "IP sudah terdaftar" }, { status: 400 });
  }
}

// DELETE dan PUT juga ganti lokasi jadi nama_wifi
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.ipLokasi.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal hapus" }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { ip, nama_wifi } = await request.json();
  try {
    const updated = await prisma.ipLokasi.update({
      where: { id: Number(params.id) },
      data: { ip, nama_wifi },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Gagal update" }, { status: 400 });
  }
}
