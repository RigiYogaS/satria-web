import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // buat object headers sederhana untuk inspeksi
  const headersObj: Record<string, string | null> = {};
  for (const [k, v] of request.headers) headersObj[k] = v ?? null;

  const candidates = [
    "x-client-ip",
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "fastly-client-ip",
    "true-client-ip",
    "x-cluster-client-ip",
    "forwarded",
  ];
  const found: Record<string, string | null> = {};
  for (const c of candidates) found[c] = request.headers.get(c);

  // kembalikan untuk debug (hapus/ubah ke production setelah beres)
  return NextResponse.json({
    debug: {
      headersSample: found,
      allHeaders: headersObj,
    },
  });
}
