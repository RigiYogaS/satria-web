import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Mendapatkan semua IP yang diizinkan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get("ip");

    // Jika ada query ip, cari satu data saja
    if (ip) {
      const ipData = await prisma.ipLokasi.findUnique({
        where: { ip },
        select: { nama_wifi: true },
      });
      return NextResponse.json({ nama_wifi: ipData?.nama_wifi || null });
    }

    // Jika tidak ada query ip, kembalikan list (seperti sebelumnya)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const ipData = await prisma.ipLokasi.findMany({
      select: {
        id: true,
        ip: true,
        nama_wifi: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ip, nama_wifi } = await request.json();
    const updated = await prisma.ipLokasi.update({
      where: { id: Number(params.id) },
      data: { ip, nama_wifi },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Gagal update" }, { status: 400 });
  }
}
