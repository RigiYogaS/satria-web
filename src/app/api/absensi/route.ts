import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      latitude,
      longitude,
      accuracy,
      jamDatang,
      jamPulang,
      laporanHarian,
      bypassAuth, 
    } = body;

    // ✅ BYPASS AUTHENTICATION FOR TESTING
    let userId: number;

    if (bypassAuth) {
      console.log("🔧 BYPASSING AUTHENTICATION FOR TESTING");
      userId = 1; // Use default user ID for testing
    } else {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = parseInt(session.user.id);
    }

    // ✅ GET TODAY'S DATE IN LOCAL TIME
    const today = new Date();
    const indonesiaDate = new Date(today.getTime() + 7 * 60 * 60 * 1000); // UTC+7
    indonesiaDate.setHours(0, 0, 0, 0);

    if (type === "checkin") {
      // Check if already checked in today
      const existingCheckin = await prisma.absensi.findFirst({
        where: {
          user_id: userId,
          tanggal: indonesiaDate,
        },
      });

      if (existingCheckin) {
        return NextResponse.json(
          { error: "Sudah check-in hari ini" },
          { status: 400 }
        );
      }

      // ✅ Create check-in dengan GPS - explicit fields
      const newAbsensi = await prisma.absensi.create({
        data: {
          user_id: userId,
          tanggal: indonesiaDate,
          waktu: new Date(),
          latitude: latitude ? parseFloat(latitude.toString()) : null,
          longitude: longitude ? parseFloat(longitude.toString()) : null,
          accuracy: accuracy ? parseFloat(accuracy.toString()) : null,
          status: "Hadir",
          ip_address: "192.168.200.53",
        },
      });

      console.log("✅ Check-in created:", newAbsensi.id_absensi);

      return NextResponse.json({
        success: true,
        message: "Check-in berhasil",
        data: { jamDatang, id: newAbsensi.id_absensi },
      });
    } else if (type === "checkout") {
      // ✅ Update existing record dengan checkout time dan laporan
      const result = await prisma.absensi.updateMany({
        where: {
          user_id: userId,
          tanggal: indonesiaDate,
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

      console.log("✅ Check-out updated:", result.count, "records");

      return NextResponse.json({
        success: true,
        message: "Check-out berhasil",
        data: { jamPulang, laporan: laporanHarian },
      });
    }

    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Absensi API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // ✅ BYPASS AUTHENTICATION FOR GET REQUEST TOO
    let userId: number;

    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = parseInt(session.user.id);
      } else {
        console.log("🔧 No session found, using default user ID");
        userId = 1; // Use default user ID
      }
    } catch (error) {
      console.log("🔧 Session error, using default user ID");
      userId = 1;
    }

    // ✅ GET TODAY'S DATE IN LOCAL TIME
    const today = new Date();
    const indonesiaDate = new Date(today.getTime() + 7 * 60 * 60 * 1000); // UTC+7
    indonesiaDate.setHours(0, 0, 0, 0);

    console.log(
      "🔍 Checking absensi for date:",
      indonesiaDate.toISOString().split("T")[0],
      "User ID:",
      userId
    );

    // ✅ Get today's absensi with GPS and checkout data
    const absensi = await prisma.absensi.findFirst({
      where: {
        user_id: userId,
        tanggal: indonesiaDate,
      },
    });

    console.log("📊 Absensi found:", !!absensi, absensi?.id_absensi);

    if (!absensi) {
      return NextResponse.json({
        success: true,
        data: {
          hasCheckedIn: false,
          hasCheckedOut: false,
          absensi: null,
        },
      });
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
        },
      },
    });
  } catch (error) {
    console.error("❌ Get Absensi Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
