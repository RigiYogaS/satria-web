import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchIpPattern, cleanIpString } from "@/lib/ip";

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

// --- new helper: server-side validator using ip_lokasi patterns
async function validateDetectedList(detected: string[] = [], userId?: number) {
  if (!detected || detected.length === 0) return { ok: false };

  // patterns from ip_lokasi (CIDR/prefix/exact)
  const allowed = await prisma.ipLokasi.findMany({
    select: { ip: true, nama_wifi: true },
  });

  // normalize detected -> ensure strings only
  const cleanedDetected = detected
    .map((d) => cleanIpString(d) ?? d)
    .filter((p): p is string => !!p);

  // 1) check against ip_lokasi patterns (skip null patterns)
  for (const a of allowed) {
    const pattern = a.ip;
    if (!pattern) continue;
    for (const ip of cleanedDetected) {
      if (matchIpPattern(pattern, ip)) {
        return {
          ok: true,
          pattern,
          nama_wifi: a.nama_wifi,
          source: "ip_lokasi",
        };
      }
    }
  }

  // 2) fallback: check recent absensi IPs for this user (last 30 days)
  if (userId) {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recent = await prisma.absensi.findMany({
      where: {
        user_id: userId,
        ip_address: { not: null },
        waktu: { gte: cutoff },
      },
      select: { ip_address: true },
    });

    // normalize recentIps and narrow type to string[]
    const recentIps = recent
      .map((r) => cleanIpString(r.ip_address) ?? r.ip_address)
      .filter((p): p is string => !!p);

    for (const pattern of recentIps) {
      for (const ip of cleanedDetected) {
        // direct compare or pattern matching
        if (
          pattern === ip ||
          matchIpPattern(pattern, ip) ||
          matchIpPattern(ip, pattern)
        ) {
          return { ok: true, pattern, source: "recent_absensi" };
        }
        // also try /24 derived from recent ip
        const cidr = pattern.replace(
          /^([0-9]+\.[0-9]+\.[0-9]+)\.[0-9]+$/,
          "$1.0/24"
        );
        if (cidr && matchIpPattern(cidr, ip)) {
          return { ok: true, pattern: cidr, source: "recent_absensi_cidr" };
        }
      }
    }
  }

  return { ok: false };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(session.user.id);

    const body = await request.json();
    const { type, ...data } = body;

    // build detected array (tambah fallback ipAddress)
    const detectedArray: string[] = Array.isArray(data.detected)
      ? data.detected
      : data.clientIp
      ? [data.clientIp]
      : data.ipAddress
      ? [data.ipAddress]
      : [];

    // server-side validation BEFORE creating absensi
    const validation = await validateDetectedList(detectedArray, userId);
    if (!validation.ok) {
      // persist detected attempt for admin review
      try {
        await prisma.detectedIpLog.create({
          data: {
            user_id: userId,
            detected: detectedArray,
            client_ip: data.clientIp ?? null,
            user_agent: request.headers.get("user-agent") ?? "",
          },
        });
      } catch (e) {
        console.warn("failed to save detected log:", e);
      }
      return NextResponse.json(
        { error: "Anda tidak berada di jaringan kantor" },
        { status: 403 }
      );
    }

    // Ambil tanggal hari ini (tanpa jam)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    if (type === "checkin") {
      const existing = await prisma.absensi.findFirst({
        where: {
          user_id: userId,
          tanggal: {
            gte: startOfDay,
            lte: endOfDay,
          },
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

      // Ganti cara membuat tanggal:
      const tanggalUTC = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );

      // Simpan absensi baru (ip_address simpan cleaned clientIp)
      await prisma.absensi.create({
        data: {
          user_id: userId,
          tanggal: tanggalUTC,
          waktu: now,
          lokasi: data.lokasi,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          ip_address: cleanIpString(data.clientIp) ?? null,
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
          tanggal: {
            gte: startOfDay,
            lte: endOfDay,
          },
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
          laporan_harian: data.laporanHarian ?? data.laporan ?? null,
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

    // resolve nama_wifi by matching saved ip_address against ip_lokasi patterns
    let namaWifi = null;
    if (absensi.ip_address) {
      const allowed = await prisma.ipLokasi.findMany({
        select: { ip: true, nama_wifi: true },
      });
      const ip = cleanIpString(absensi.ip_address) ?? absensi.ip_address;
      for (const a of allowed) {
        if (matchIpPattern(a.ip, ip)) {
          namaWifi = a.nama_wifi ?? null;
          break;
        }
      }
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
