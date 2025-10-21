import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = parseInt(session.user.id);

  // Ambil absensi hari ini (reset otomatis setiap hari)
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const endOfDayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );

  const absensi = await prisma.absensi.findFirst({
    where: {
      user_id: userId,
      tanggal: {
        gte: todayUTC,
        lt: endOfDayUTC,
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      hasCheckedIn: !!absensi,
      hasCheckedOut: !!absensi?.jam_checkout,
      absensi: absensi
        ? {
            waktu: absensi.waktu,
            checkoutTime: absensi.jam_checkout,
            lokasi: absensi.lokasi,
            latitude: absensi.latitude,
            longitude: absensi.longitude,
            accuracy: absensi.accuracy,
            ipAddress: absensi.ip_address,
            namaWifi: undefined,
            checkinStatus: absensi.checkin_status,
            checkoutStatus: absensi.checkout_status,
          }
        : null,
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = parseInt(session.user.id);
  const body = await req.json();

  const { latitude, longitude, accuracy, ipAddress } = body;

  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  // Tentukan status check-in
  const jam = now.getHours();
  const menit = now.getMinutes();
  let checkin_status: "tepat_waktu" | "telat" = "telat";
  if (jam < 8 || (jam === 8 && menit === 0)) checkin_status = "tepat_waktu";

  const existing = await prisma.absensi.findFirst({
    where: {
      user_id: userId,
      tanggal: {
        gte: todayUTC,
        lt: new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Sudah check-in hari ini" },
      { status: 400 }
    );
  }

  await prisma.absensi.create({
    data: {
      user_id: userId,
      waktu: now,
      tanggal: todayUTC, 
      status: "Hadir",
      latitude,
      longitude,
      accuracy,
      ip_address: ipAddress,
      checkin_status,
    },
  });

  return NextResponse.json({ success: true });
}
