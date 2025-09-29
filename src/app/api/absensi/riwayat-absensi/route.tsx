// src/app/api/riwayat-absensi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      user_id: parseInt(userId),
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // hari setelah endDate
      end.setHours(0, 0, 0, 0);

      where.tanggal = {
        gte: start,
        lt: end,
      };

      console.log("userId:", userId);
      console.log("start:", start.toISOString());
      console.log("end:", end.toISOString());
    }

    const absensi = await prisma.absensi.findMany({
      where,
      orderBy: {
        tanggal: "desc",
      },
      skip,
      take: limit,
    });

    const mapped = absensi.map((a) => ({
      id: a.id_absensi || a.id_absensi || 0,
      name: a.user_id || "", 
      date: a.tanggal || "", 
      tanggal: a.tanggal,
      status: a.status,
      waktu_masuk: a.waktu || a.tanggal, 
      waktu_keluar: a.jam_checkout || null,
    }));

    return NextResponse.json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
