import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(session.user.id);

    // Hitung waktu hari ini (WIB)
    const now = new Date();
    const utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    utc7.setHours(0, 0, 0, 0);
    const besok = new Date(utc7.getTime() + 24 * 60 * 60 * 1000);

    // Query absensi hari ini
    const absensi = await prisma.absensi.findFirst({
      where: {
        user_id: userId,
        waktu: {
          gte: utc7,
          lt: besok,
        },
      },
    });

    if (!absensi) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // Ambil nama wifi dari IpLokasi
    let namaWifi = null;
    if (absensi.ip_address) {
      const ipLokasi = await prisma.ipLokasi.findUnique({
        where: { ip: absensi.ip_address },
      });
      namaWifi = ipLokasi?.nama_wifi || null;
    }

    return NextResponse.json({
      success: true,
      data: {
        hasCheckedIn: true,
        hasCheckedOut: !!absensi.jam_checkout,
        absensi: {
          waktu: absensi.waktu,
          latitude: absensi.latitude,
          longitude: absensi.longitude,
          accuracy: absensi.accuracy,
          checkoutTime: absensi.jam_checkout,
          laporanHarian: absensi.laporan_harian,
          ipAddress: absensi.ip_address, 
          namaWifi, 
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
