import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data } = supabase
    .storage
    .from("resume")
    .getPublicUrl("Max-Lichter-Resume.pdf");

  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const res = await fetch(publicUrl, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Max-Lichter-Resume.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
