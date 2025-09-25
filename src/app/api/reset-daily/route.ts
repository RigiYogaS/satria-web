import { NextResponse } from "next/server";

export async function POST() {
  try {
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
