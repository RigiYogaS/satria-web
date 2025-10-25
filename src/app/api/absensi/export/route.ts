import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function escapeCsvCell(v: any) {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}
function formatDate(d: any) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().slice(0, 10);
}
function formatTimeShort(d: any) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().slice(11, 16);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const userIdParam = url.searchParams.get("userId");
  const debug = url.searchParams.get("debug") === "1";

  if (!userIdParam) {
    return new Response(JSON.stringify({ error: "Missing userId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userIdNum = Number(userIdParam);
  if (isNaN(userIdNum)) {
    return new Response(JSON.stringify({ error: "Invalid userId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // try get user for filename
  const user =
    (await prisma.users.findUnique({
      where: { id_user: userIdNum },
      select: { id_user: true, nama: true, email: true },
    })) ??
    (await prisma.users
      .findUnique({
        where: { id_user: userIdNum },
        select: { id_user: true, nama: true, email: true },
      })
      .catch(() => null));

  const safeName =
    (user?.nama &&
      String(user.nama)
        .replace(/[^a-z0-9_\- ]/gi, "_")
        .trim()) ||
    `user_${userIdNum}`;

  // try multiple strategies to find absensi rows
  let rows: any[] = [];

  // 1) relation filter (user relation)
  try {
    rows = await prisma.absensi.findMany({
      where: { user: { id_user: userIdNum } },
      orderBy: { tanggal: "asc" },
    });
  } catch (e) {
    rows = [];
  }

  // 2) direct user_id column
  if (!rows || rows.length === 0) {
    try {
      rows = await prisma.absensi.findMany({
        where: { user_id: userIdNum },
        orderBy: { tanggal: "asc" },
      });
    } catch (e) {
      rows = [];
    }
  }

  // 3) alternate column name id_user
  if (!rows || rows.length === 0) {
    try {
      rows = await prisma.absensi.findMany({
        where: { id_absensi: userIdNum },
        orderBy: { tanggal: "asc" },
      });
    } catch (e) {
      rows = [];
    }
  }

  // 4) fallback raw SQL (if prisma model columns different)
  if (!rows || rows.length === 0) {
    try {
      rows = (await prisma.$queryRawUnsafe(
        `SELECT * FROM absensi WHERE user_id = ${userIdNum} ORDER BY tanggal ASC`
      )) as any[];
    } catch (e) {
      // ignore
    }
  }

  if (debug) {
    return NextResponse.json({
      triedUserId: userIdNum,
      found: rows.length,
      sample: rows.slice(0, 5),
    });
  }

  if (!rows || rows.length === 0) {
    return new Response(
      JSON.stringify({ error: "No absensi found for user" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // build CSV
  const headers = [
    "tanggal",
    "waktu_masuk",
    "waktu_keluar",
    "lokasi",
    "ip_address",
    "checkin_status",
    "checkout_status",
    "laporan_harian",
  ];
  let csv = headers.join(",") + "\n";

  for (const r of rows) {
    const tanggal = formatDate(r.tanggal ?? r.date ?? null);
    const waktuMasuk = formatTimeShort(
      r.waktu ?? r.waktu_masuk ?? r.time ?? null
    );
    const waktuKeluar = formatTimeShort(
      r.jam_checkout ?? r.waktu_keluar ?? r.checkout_time ?? null
    );
    const lokasi = r.lokasi ?? r.location ?? "";
    const ip = r.ip_address ?? r.ip ?? "";
    const checkin = r.checkin_status ?? "";
    const checkout = r.checkout_status ?? "";
    const laporan = (r as any).laporan_harian ?? (r as any).laporan ?? "";

    const line = [
      tanggal,
      waktuMasuk,
      waktuKeluar,
      lokasi,
      ip,
      checkin,
      checkout,
      laporan,
    ]
      .map(escapeCsvCell)
      .join(",");
    csv += line + "\n";
  }

  // BOM for Excel + filename with user name
  const bom = "\uFEFF";
  const filename = `riwayat_absensi_${safeName}.csv`;

  return new Response(bom + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
