import { NextRequest, NextResponse } from "next/server";

const ALLOWED_IPS = [
  "192.168.200.53", // Tambahkan IP kantor lain jika perlu
];

export async function GET(request: NextRequest) {
  try {
    // Get all possible IP sources
    const forwarded = request.headers.get("x-forwarded-for");
    const real = request.headers.get("x-real-ip");
    const cfConnectingIP = request.headers.get("cf-connecting-ip");
    const xClientIP = request.headers.get("x-client-ip");

    // Get the actual client IP
    let clientIP = "unknown";

    if (forwarded) {
      const ips = forwarded.split(",").map((ip) => ip.trim());
      clientIP = ips[0];
    } else if (real) {
      clientIP = real;
    } else if (cfConnectingIP) {
      clientIP = cfConnectingIP;
    } else if (xClientIP) {
      clientIP = xClientIP;
    }

    // Clean IPv6 prefix (::ffff:) from IPv4 addresses
    if (clientIP && clientIP.startsWith("::ffff:")) {
      clientIP = clientIP.substring(7);
    }

    // Jangan override IP di development!
    // Validasi di backend
    const isValid = ALLOWED_IPS.includes(clientIP);

    return NextResponse.json({
      ip: clientIP,
      isValid,
      allowed: ALLOWED_IPS,
      success: true,
    });
  } catch (error) {
    console.error("Error getting IP:", error);
    return NextResponse.json(
      {
        error: "Failed to get IP address",
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
