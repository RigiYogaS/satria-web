export function cleanIpString(raw?: string | null): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  return s.includes("::ffff:") ? s.split("::ffff:").pop()!.trim() : s;
}

export function ipToInt(ip: string): number {
  const parts = ip.split(".").map((p) => parseInt(p, 10) || 0);
  return (
    ((((parts[0] >>> 0) << 24) >>> 0) +
      (((parts[1] >>> 0) << 16) >>> 0) +
      (((parts[2] >>> 0) << 8) >>> 0) +
      ((parts[3] >>> 0) >>> 0)) >>>
    0
  );
}

export function isIpInCidr(ip: string, cidr: string): boolean {
  try {
    const [net, maskStr] = cidr.split("/");
    const mask = Number(maskStr);
    if (Number.isNaN(mask)) return false;
    const ipInt = ipToInt(ip);
    const netInt = ipToInt(net);
    const maskInt = mask === 0 ? 0 : (~0 << (32 - mask)) >>> 0;
    return (ipInt & maskInt) === (netInt & maskInt);
  } catch {
    return false;
  }
}

export function matchIpPattern(
  pattern: string,
  rawIp?: string | null
): boolean {
  if (!pattern || !rawIp) return false;
  const ip = cleanIpString(rawIp);
  if (!ip) return false;
  if (pattern === ip) return true;
  if (pattern.endsWith(".")) return ip.startsWith(pattern);
  if (pattern.includes("/")) return isIpInCidr(ip, pattern);
  return false;
}
