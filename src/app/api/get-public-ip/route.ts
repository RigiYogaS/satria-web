import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    if (!res.ok) throw new Error("ipify fetch failed");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("get-public-ip error:", err);
    return NextResponse.json(
      { ip: null, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
