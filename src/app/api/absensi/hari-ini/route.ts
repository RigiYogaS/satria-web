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

  // Ambil absensi hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = new Date(today);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const absensi = await prisma.absensi.findFirst({
    where: {
      user_id: userId,
      tanggal: {
        gte: startOfDay,
        lte: endOfDay,
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
            namaWifi: undefined, // isi jika ada
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
  const tanggal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Tentukan status check-in
  const jam = now.getHours();
  const menit = now.getMinutes();
  let checkin_status: "tepat_waktu" | "telat" = "telat";
  if (jam < 8 || (jam === 8 && menit === 0)) checkin_status = "tepat_waktu";

  // Simpan ke database
  await prisma.absensi.create({
    data: {
      user_id: userId,
      waktu: now,
      tanggal,
      status: "Hadir",
      latitude,
      longitude,
      accuracy,
      ip_address: ipAddress,
      checkin_status, // <-- tambahkan ini!
    },
  });

  return NextResponse.json({ success: true });
}
