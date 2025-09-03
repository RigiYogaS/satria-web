import nodemailer from "nodemailer";

// Konfigurasi SMTP transporter
const createTransporter = () => {
  // Check required environment variables
  const requiredEnvVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "FROM_EMAIL"];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error("❌ Missing email environment variables:", missingVars);
    throw new Error(`Missing email configuration: ${missingVars.join(", ")}`);
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true untuk 465, false untuk port lain
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Fungsi untuk generate OTP (6 digit)
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Fungsi untuk kirim email OTP
export async function sendOTPEmail(
  email: string,
  nama: string,
  otp: string
): Promise<boolean> {
  try {
    console.log(`🔄 Attempting to send OTP email to ${email}`);

    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME || "Sistem SATRIA"} <${
        process.env.FROM_EMAIL
      }>`,
      to: email,
      subject: "Verifikasi Email - Sistem SATRIA",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Verifikasi Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #214D83 0%, #B3C6DE 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <img src="${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/logo/divhub.png" alt="DivHub Logo" style="max-width: 80px; height: auto; margin-bottom: 15px;">
            <h1 style="margin: 0; font-size: 28px;">SATRIA</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Sistem Absensi Tepat, Responsif, Interaktif dan Akurat</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Halo ${nama}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Terima kasih telah mendaftar di Sistem SATRIA. Untuk menyelesaikan proses registrasi Anda, 
              silakan verifikasi email Anda dengan memasukkan kode OTP berikut:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 2px dashed #667eea;">
              <h1 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: 'Courier New', monospace;">
                ${otp}
              </h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 14px;">Kode OTP Anda</p>
            </div>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2; font-size: 14px;">
                <strong>⏰ Penting:</strong> Kode OTP ini berlaku selama <strong>15 menit</strong> sejak email ini dikirim.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Jika Anda tidak melakukan registrasi di Sistem SATRIA, abaikan email ini.
              Untuk keamanan, jangan bagikan kode OTP ini kepada siapa pun.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p>© 2025 Sistem SATRIA. Semua hak dilindungi.</p>
            <p>Email ini dikirim secara otomatis, mohon jangan membalas.</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    return false;
  }
}

// Fungsi untuk kirim email notifikasi registrasi berhasil
export async function sendWelcomeEmail(
  email: string,
  nama: string
): Promise<boolean> {
  try {
    console.log(`🔄 Attempting to send welcome email to ${email}`);

    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME || "Sistem SATRIA"} <${
        process.env.FROM_EMAIL
      }>`,
      to: email,
      subject: "Selamat Datang di Sistem SATRIA",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Selamat Datang</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <img src="${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/logo/divhub.png" alt="DivHub Logo" style="max-width: 80px; height: auto; margin-bottom: 15px;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Selamat Datang!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Akun Anda telah berhasil diverifikasi</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Halo ${nama}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Selamat! Email Anda telah berhasil diverifikasi dan akun Anda sudah aktif.
              Anda sekarang dapat masuk ke Sistem SATRIA dan mulai menggunakan layanan kami.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Masuk ke Sistem SATRIA
              </a>
            </div>
            
            <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32; font-size: 14px;">
                <strong>✅ Tips:</strong> Simpan email dan password Anda dengan aman. 
                Gunakan password yang kuat untuk menjaga keamanan akun.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Jika Anda mengalami kesulitan atau memiliki pertanyaan, 
              silakan hubungi administrator sistem.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p>© 2025 Sistem SATRIA. Semua hak dilindungi.</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return false;
  }
}

// Fungsi untuk kirim email reset password
export async function sendPasswordResetEmail(
  email: string,
  nama: string,
  resetToken: string
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Reset Password - Sistem SATRIA",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo/divhub.png" alt="DivHub Logo" style="max-width: 80px; height: auto; margin-bottom: 15px;">
            <h1 style="margin: 0; font-size: 28px;">SATRIA</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Sistem Absensi Tepat, Responsif, Interaktif dan Akurat</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Halo ${nama}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Kami menerima permintaan untuk reset password akun Anda. Gunakan kode berikut untuk membuat password baru:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 2px dashed #667eea;">
              <h1 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: 'Courier New', monospace;">
                ${resetToken}
              </h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 14px;">Kode Reset Password</p>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⏰ Penting:</strong> Kode ini berlaku selama <strong>15 menit</strong> sejak email ini dikirim.
              </p>
            </div>
            
            <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #721c24; font-size: 14px;">
                <strong>🔒 Keamanan:</strong> Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tetap aman.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Jika Anda mengalami masalah, jangan ragu untuk menghubungi tim support kami.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #eee;">
            <p style="margin: 0;">© 2025 Sistem SATRIA. Semua hak dilindungi.</p>
            <p style="margin: 5px 0 0;">Email ini dikirim secara otomatis, mohon jangan membalas.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset password email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending reset password email:", error);
    return false;
  }
}
