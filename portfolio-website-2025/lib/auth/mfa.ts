// lib/auth/mfa.ts
import crypto from "crypto";

export function verifyMfaCookie(raw: string | undefined, userId: string): boolean {
  if (!raw) return false;
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot < 0) return false;
    const payload = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    const expected = crypto
      .createHmac("sha256", process.env.MFA_COOKIE_SECRET!)
      .update(payload)
      .digest("hex");
    if (sig !== expected) return false;
    const { uid, iat } = JSON.parse(payload) as { uid: string; iat: number };
    if (uid !== userId) return false;
    if (Date.now() / 1000 - iat > 10 * 60) return false;
    return true;
  } catch {
    return false;
  }
}
