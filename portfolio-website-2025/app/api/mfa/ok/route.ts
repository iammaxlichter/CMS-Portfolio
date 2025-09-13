import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

const MAX_AGE = 10 * 60;

export async function POST() {
  const c = await cookies();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const payload = JSON.stringify({ uid: user.id, iat: Math.floor(Date.now()/1000) });
  const sig = crypto.createHmac("sha256", process.env.MFA_COOKIE_SECRET!).update(payload).digest("hex");

  c.set({
    name: "mfa_ok",
    value: Buffer.from(`${payload}.${sig}`).toString("base64url"),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).set({ name: "mfa_ok", value: "", path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}
