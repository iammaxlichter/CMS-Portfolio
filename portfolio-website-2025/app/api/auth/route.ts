// app/api/auth/route.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { event, session } = await req.json();

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    await supabase.auth.setSession({
      access_token: session?.access_token ?? "",
      refresh_token: session?.refresh_token ?? "",
    });
  } else if (event === "SIGNED_OUT") {
    await supabase.auth.signOut();

    cookieStore.set({
      name: "mfa_ok",
      value: "",
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return NextResponse.json({ ok: true });
}
