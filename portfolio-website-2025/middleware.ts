import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

async function verifyMfaCookieEdge(raw: string | undefined, userId: string): Promise<boolean> {
  if (!raw) return false;
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot < 0) return false;

    const payload = decoded.slice(0, dot);
    const sigHex = decoded.slice(dot + 1);

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(process.env.MFA_COOKIE_SECRET!),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    const macHex = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, "0")).join("");
    if (macHex !== sigHex) return false;

    const { uid, iat } = JSON.parse(payload) as { uid: string; iat: number };
    if (uid !== userId) return false;
    if (Math.floor(Date.now() / 1000) - iat > 10 * 60) return false; // 10 min TTL
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  const path = new URL(req.url).pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const signin = new URL("/admin/signin", req.url);
    signin.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signin);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const isAuthFlow =
    path.startsWith("/admin/mfa/") ||
    path.startsWith("/admin/signin");

  if (!isAuthFlow) {
    const mfaCookie = req.cookies.get("mfa_ok")?.value;
    const ok = await verifyMfaCookieEdge(mfaCookie, user.id);
    if (!ok) return NextResponse.redirect(new URL("/admin/mfa/verify", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
