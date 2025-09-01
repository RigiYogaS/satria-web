import { NextResponse } from "next/server";
import { generateOTP, sendOTPEmail } from "../../../lib/email";

export async function GET() {
  console.log("🔍 Testing email configuration...");

  // Check environment variables
  const emailConfig = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS
      ? `${process.env.SMTP_PASS.substring(0, 4)}...`
      : "NOT SET",
    FROM_EMAIL: process.env.FROM_EMAIL,
    FROM_NAME: process.env.FROM_NAME,
    hasSpaces: process.env.SMTP_PASS
      ? process.env.SMTP_PASS.includes(" ")
      : false,
    passwordLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
  };

  console.log("📧 Email Config:", emailConfig);

  return NextResponse.json({
    message: "Email configuration test",
    config: emailConfig,
  });
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log(`🔄 Testing email send to: ${email}`);

    const otp = generateOTP();
    const success = await sendOTPEmail(email, "Test User", otp);

    return NextResponse.json({
      success,
      message: success
        ? "Test email sent successfully"
        : "Failed to send test email",
      otp: otp, // Only for testing - remove in production
    });
  } catch (error: any) {
    console.error("❌ Test email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
