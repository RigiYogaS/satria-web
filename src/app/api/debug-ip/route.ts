import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Ambil semua informasi IP yang tersedia
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const remoteAddr = request.headers.get("remote-addr");
    const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare
    const xOriginalForwarded = request.headers.get("x-original-forwarded-for");

    // Headers lainnya yang mungkin berguna
    const userAgent = request.headers.get("user-agent");
    const host = request.headers.get("host");

    return NextResponse.json({
      headers: {
        "x-forwarded-for": forwarded,
        "x-real-ip": realIP,
        "remote-addr": remoteAddr,
        "cf-connecting-ip": cfConnectingIp,
        "x-original-forwarded-for": xOriginalForwarded,
        "user-agent": userAgent,
        host: host,
      },
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      note: "Data ini untuk debugging - lihat IP mana yang sebenarnya dari WiFi kantor Anda",
    });
  } catch (error) {
    console.error("Error getting debug info:", error);

    return NextResponse.json({
      error: "Unable to get debug info",
      timestamp: new Date().toISOString(),
    });
  }
}
