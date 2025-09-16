import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Reset daily logic jika diperlukan
    // Misalnya: update status, cleanup temporary data, etc

    return NextResponse.json({
      success: true,
      message: "Daily reset completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Daily reset error:", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
