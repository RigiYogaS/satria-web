import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Mendapatkan semua IP yang diizinkan
export async function GET() {
  try {
    const ipData = await prisma.ipLokasi.findMany({
      select: {
        id: true,
        ip: true,
        nama_wifi: true,
        created_at: true,
      },
    });

    return NextResponse.json(ipData);
  } catch (error) {
    console.error("Error fetching IP data:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data IP" },
      { status: 500 }
    );
  }
}

// POST: Menambah IP baru (untuk admin)
export async function POST(request: Request) {
  try {
    const { ip, nama_wifi } = await request.json();

    if (!ip || !nama_wifi) {
      return NextResponse.json(
        { error: "IP dan nama WiFi wajib diisi" },
        { status: 400 }
      );
    }

    const newIP = await prisma.ipLokasi.create({
      data: { ip, nama_wifi },
    });

    return NextResponse.json(newIP);
  } catch (error) {
    console.error("Error creating IP:", error);
    return NextResponse.json(
      { error: "IP sudah terdaftar atau terjadi kesalahan" },
      { status: 400 }
    );
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
