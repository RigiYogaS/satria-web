import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, latitude, longitude, accuracy, laporanHarian } = body;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(session.user.id);

    // Range hari ini UTC
    const { startOfDay, endOfDay } = getTodayRangeUTC();

    if (type === "checkin") {
      // Cek sudah check-in hari ini
      const existingCheckin = await prisma.absensi.findFirst({
        where: {
          user_id: userId,
          tanggal: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      if (existingCheckin) {
        return NextResponse.json(
          { error: "Sudah check-in hari ini" },
          { status: 400 }
        );
      }

      const newAbsensi = await prisma.absensi.create({
        data: {
          user_id: userId,
          tanggal: new Date(), 
          latitude: latitude ? parseFloat(latitude.toString()) : null,
          longitude: longitude ? parseFloat(longitude.toString()) : null,
          accuracy: accuracy ? parseFloat(accuracy.toString()) : null,
          status: "Hadir",
          ip_address: "",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Check-in berhasil",
        data: { id: newAbsensi.id_absensi },
      });
    } else if (type === "checkout") {
      const result = await prisma.absensi.updateMany({
        where: {
          user_id: userId,
          tanggal: {
            gte: startOfDay,
            lt: endOfDay,
          },
          jam_checkout: null,
        },
        data: {
          jam_checkout: new Date(),
          laporan_harian: laporanHarian,
        },
      });

      if (result.count === 0) {
        return NextResponse.json(
          { error: "Belum check-in atau sudah check-out" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Check-out berhasil",
      });
    }

    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400 }
    );
  } catch (error) {
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
