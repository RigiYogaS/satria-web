import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper: Dapatkan awal dan akhir hari dalam UTC
function getTodayRangeUTC() {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  );
  const endOfDay = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0
    )
  );
  return { startOfDay, endOfDay };
}

export async function POST(request: NextRequest) {
  try {
    // Ambil userId dari session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(session.user.id);

    const body = await request.json();
    const { type, ...data } = body;

    // Ambil tanggal hari ini (tanpa jam)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (type === "checkin") {
      // Cek sudah absen hari ini?
      const existing = await prisma.absensi.findFirst({
        where: {
          user_id: userId,
          tanggal: today,
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Sudah check-in hari ini" },
          { status: 400 }
        );
      }

      // Tentukan status check-in
      const now = new Date();
      const jam = now.getHours();
      const menit = now.getMinutes();
      let checkin_status: "tepat_waktu" | "telat" = "telat";
      if (jam < 8 || (jam === 8 && menit === 0)) checkin_status = "tepat_waktu";

      // Simpan absensi baru
      await prisma.absensi.create({
        data: {
          user_id: userId,
          tanggal: today,
          waktu: now,
          lokasi: data.lokasi,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          ip_address: data.ipAddress,
          checkin_status,
          status: "Hadir",
        },
      });
      return NextResponse.json({ success: true });
    }

    if (type === "checkout") {
      // Update absensi hari ini
      const absensi = await prisma.absensi.findFirst({
        where: {
          user_id: userId,
          tanggal: today,
        },
      });
      if (!absensi) {
        return NextResponse.json(
          { error: "Belum check-in hari ini" },
          { status: 400 }
        );
      }
      if (absensi.jam_checkout) {
        return NextResponse.json(
          { error: "Sudah check-out hari ini" },
          { status: 400 }
        );
      }

      const now = new Date();
      const jam = now.getHours();

      let checkout_status: "normal" | "lembur" | "setengah_hari" = "normal";
      if (jam < 13) checkout_status = "setengah_hari";
      else if (jam > 16) checkout_status = "lembur";

      await prisma.absensi.update({
        where: { id_absensi: absensi.id_absensi },
        data: {
          jam_checkout: now,
          checkout_status,
          laporan_harian: data.laporanHarian,
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error in absensi API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(session.user.id);

    // Range hari ini UTC
    const { startOfDay, endOfDay } = getTodayRangeUTC();

    const absensi = await prisma.absensi.findFirst({
      where: {
        user_id: userId,
        tanggal: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    if (!absensi) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    let namaWifi = null;
    if (absensi.ip_address) {
      const ipLokasi = await prisma.ipLokasi.findUnique({
        where: { ip: absensi.ip_address },
      });
      namaWifi = ipLokasi?.nama_wifi || null;
    }

    return NextResponse.json({
      success: true,
      data: absensi,
      nama_wifi: namaWifi,
    });
  } catch (error) {
    console.error("Error in GET absensi:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
