import { NextResponse } from "next/server";

async function tryIpify() {
  const res = await fetch("https://api.ipify.org?format=json");
  if (!res.ok) throw new Error("ipify failed");
  return (await res.json()).ip;
}

async function tryIpinfo() {
  const res = await fetch("https://ipinfo.io/json");
  if (!res.ok) throw new Error("ipinfo failed");
  return (await res.json()).ip;
}

async function tryIfconfig() {
  const res = await fetch("https://ifconfig.me/ip");
  if (!res.ok) throw new Error("ifconfig failed");
  return (await res.text()).trim();
}

export async function GET() {
  try {
    const services = [tryIpify, tryIpinfo, tryIfconfig];
    for (const fn of services) {
      try {
        const ip = await fn();
        if (ip) return NextResponse.json({ ip });
      } catch (err) {
      }
    }
    // none succeeded
    return NextResponse.json(
      { ip: null, error: "all services failed" },
      { status: 500 }
    );
  } catch (err) {
    console.error("get-public-ip error:", err);
    return NextResponse.json(
      { ip: null, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
