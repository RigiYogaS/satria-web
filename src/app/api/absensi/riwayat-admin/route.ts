import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  const where: any = {
    user: {
      role: { not: "admin" },
    },
  };
  if (startDateParam && endDateParam) {
    const start = new Date(startDateParam);
    const end = new Date(endDateParam);
    end.setDate(end.getDate() + 1);

    where.tanggal = {
      gte: start,
      lte: end,
    };
  }

  // Ambil data absensi beserta nama pegawai
  const absensi = await prisma.absensi.findMany({
    where,
    include: {
      user: { select: { nama: true } },
    },
    orderBy: { tanggal: "desc" },
  });

  const mapped = absensi.map((a) => ({
    id: a.id_absensi,
    user_id: (a.user as any)?.id_user ?? (a.user as any)?.id ?? null,
    nama: a.user?.nama || "-",
    tanggal: a.tanggal,
    status: a.status,
    waktu_masuk: a.waktu,
    waktu_keluar: a.jam_checkout,
    checkin_status: a.checkin_status,
    checkout_status: a.checkout_status,
    laporan: (a as any).laporan_harian ?? (a as any).laporan ?? null,
  }));

  return NextResponse.json(mapped);
}
