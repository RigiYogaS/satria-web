import { NextRequest, NextResponse } from "next/server";
import { networkInterfaces } from "os";

export async function GET(request: NextRequest) {
  try {
    // Get network interfaces (server-side)
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
      const netInfo = nets[name];
      if (netInfo) {
        for (const net of netInfo) {
          if (net.family === "IPv4" && !net.internal) {
            results.push({
              interface: name,
              ip: net.address,
              netmask: net.netmask,
            });
          }
        }
      }
    }

    // Return the first non-internal IPv4 address
    const serverIP = results.length > 0 ? results[0].ip : "unknown";

    return NextResponse.json({
      ip: serverIP,
      success: true,
      allInterfaces: results,
      note: "This is the server's network IP, not client IP",
    });
  } catch (error) {
    console.error("Error getting network IP:", error);
    return NextResponse.json(
      {
        error: "Failed to get network IP",
        success: false,
      },
      { status: 500 }
    );
  }
}
