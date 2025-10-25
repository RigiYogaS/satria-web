import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { detected, clientIp, userAgent, userId } = body;

    if (!detected || !Array.isArray(detected)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const rec = await prisma.detectedIpLog.create({
      data: {
        user_id: userId ? Number(userId) : null,
        detected,
        client_ip: clientIp ?? null,
        user_agent: userAgent ?? null,
      },
    });

    return NextResponse.json({ success: true, id: rec.id });
  } catch (err) {
    console.error("log-detected POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// optional GET for admin review (limit recent)
export async function GET() {
  try {
    const logs = await prisma.detectedIpLog.findMany({
      orderBy: { created_at: "desc" },
      take: 200,
    });
    return NextResponse.json(logs);
  } catch (err) {
    console.error("log-detected GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
