import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchIpPattern, cleanIpString } from "@/lib/ip";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const detected: string[] = Array.isArray(body.detected)
      ? body.detected
      : body.clientIp
      ? [body.clientIp]
      : [];

    const cleaned = detected.map((d) => cleanIpString(d) || d);

    const allowed = await prisma.ipLokasi.findMany({
      select: { ip: true, nama_wifi: true },
    });

    for (const a of allowed) {
      for (const ip of cleaned) {
        if (matchIpPattern(a.ip, ip)) {
          return NextResponse.json({
            ok: true,
            pattern: a.ip,
            nama_wifi: a.nama_wifi,
          });
        }
      }
    }

    // optional: persist log for admin review
    try {
      await prisma.detectedIpLog.create({
        data: {
          detected,
          client_ip: body.clientIp ?? null,
          user_agent: request.headers.get("user-agent") ?? "",
          user_id: body.userId ? Number(body.userId) : null,
        },
      });
    } catch (e) {
      console.warn("failed to save detected log:", e);
    }

    return NextResponse.json({ ok: false });
  } catch (err) {
    console.error("validate-wifi error:", err);
    return NextResponse.json(
      { ok: false, error: "server error" },
      { status: 500 }
    );
  }
}
