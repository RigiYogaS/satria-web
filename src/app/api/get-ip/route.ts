import { NextRequest, NextResponse } from "next/server";

// Daftar IP ranges kantor yang diizinkan
// ⚠️ PENTING: Ganti dengan IP ranges WiFi kantor Anda yang sebenarnya
const ALLOWED_OFFICE_IPS = [
  // Contoh IP ranges - GANTI dengan IP asli kantor Anda
  "192.168.1.0/24", // WiFi Kantor Lantai 1
  "192.168.2.0/24", // WiFi Kantor Lantai 2
  "192.168.3.0/24", // WiFi Kantor Lantai 3
  "10.0.0.0/24", // WiFi Guest Kantor
  "172.16.1.0/24", // Network Admin

  // Tambahkan IP kantor Anda di sini setelah mengecek /api/debug-ip
  // Contoh:
  // "203.142.15.0/24",   // IP Publik Kantor
  // "114.79.8.0/24",     // IP ISP Kantor
];

// Daftar IP ranges provider seluler yang diblokir
const BLOCKED_MOBILE_PROVIDERS = [
  // Telkomsel ranges
  "114.4.0.0/16",
  "114.5.0.0/16",
  "114.6.0.0/16",
  "114.7.0.0/16",
  "202.3.208.0/20",
  "202.3.224.0/19",

  // Indosat ranges
  "202.152.0.0/16",
  "203.142.0.0/16",
  "125.164.0.0/16",

  // XL Axiata ranges
  "180.253.0.0/16",
  "103.20.0.0/16",
  "202.67.0.0/16",

  // Tri (3) ranges
  "103.47.132.0/22",
  "202.43.172.0/22",

  // Smartfren ranges
  "202.93.0.0/16",
  "103.31.0.0/16",
];

function isIPInRange(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split("/");
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);

  const ipNum = ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  const rangeNum = range
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);

  return (ipNum & mask) === (rangeNum & mask);
}

function isOfficeIP(ip: string): boolean {
  return ALLOWED_OFFICE_IPS.some((range) => isIPInRange(ip, range));
}

function isMobileProvider(ip: string): boolean {
  return BLOCKED_MOBILE_PROVIDERS.some((range) => isIPInRange(ip, range));
}

export async function GET(request: NextRequest) {
  try {
    // Ambil IP dari headers request
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");

    let clientIP = "";

    if (forwarded) {
      clientIP = forwarded.split(",")[0].trim();
    } else if (realIP) {
      clientIP = realIP;
    } else {
      // Fallback untuk NextRequest
      clientIP = "unknown";
    }

    // DISABLED: Simulasi untuk development - gunakan IP asli
    // Komentar ini untuk development, uncomment jika perlu simulasi
    /*
    if (
      clientIP === "::1" ||
      clientIP === "127.0.0.1" ||
      clientIP === "unknown"
    ) {
      const now = new Date();
      const hour = now.getHours();

      // Simulasi: Di jam kerja = IP kantor, diluar jam = IP mobile
      if (hour >= 8 && hour <= 17) {
        // Simulasi IP kantor (akan lolos validasi)
        clientIP = "192.168.1.100";
      } else {
        // Simulasi IP provider mobile (akan ditolak)
        clientIP = "114.4.1.100"; // Telkomsel
      }
    }
    */

    // Debug: Log IP yang terdeteksi
    console.log("🔍 Detected IP:", clientIP);

    // Validasi IP
    const isAllowed = isOfficeIP(clientIP);
    const isMobile = isMobileProvider(clientIP);

    let networkType = "unknown";
    let provider = "unknown";

    if (isAllowed) {
      networkType = "office-wifi";
      provider = "Office Network";
    } else if (isMobile) {
      networkType = "mobile-data";
      // Deteksi provider berdasarkan IP range
      if (isIPInRange(clientIP, "114.4.0.0/16")) provider = "Telkomsel";
      else if (isIPInRange(clientIP, "202.152.0.0/16")) provider = "Indosat";
      else if (isIPInRange(clientIP, "180.253.0.0/16")) provider = "XL Axiata";
      else if (isIPInRange(clientIP, "103.47.132.0/22")) provider = "Tri (3)";
      else if (isIPInRange(clientIP, "202.93.0.0/16")) provider = "Smartfren";
      else provider = "Mobile Provider";
    } else {
      networkType = "external";
      provider = "External Network";
    }

    return NextResponse.json({
      ip: clientIP,
      isAllowed: isAllowed,
      networkType: networkType,
      provider: provider,
      canAttend: isAllowed, // Hanya bisa absen jika IP kantor
      timestamp: new Date().toISOString(),
      message: isAllowed
        ? "Anda terhubung dari jaringan kantor"
        : `Absensi tidak dapat dilakukan dari ${provider}. Harap gunakan WiFi kantor.`,
      // Debug info
      debug: {
        originalHeaders: {
          "x-forwarded-for": forwarded,
          "x-real-ip": realIP,
        },
        detectedIP: clientIP,
        allowedRanges: ALLOWED_OFFICE_IPS,
        helpText:
          "Jika IP Anda tidak dikenali sebagai kantor, tambahkan range IP Anda ke ALLOWED_OFFICE_IPS",
      },
    });
  } catch (error) {
    console.error("Error getting client IP:", error);

    return NextResponse.json({
      ip: "unknown",
      isAllowed: false,
      networkType: "error",
      provider: "unknown",
      canAttend: false,
      timestamp: new Date().toISOString(),
      message: "Terjadi kesalahan dalam mendeteksi jaringan",
      error: "Unable to determine IP",
    });
  }
}
