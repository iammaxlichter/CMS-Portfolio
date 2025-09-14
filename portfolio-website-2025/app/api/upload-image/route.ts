// app/api/upload-image/route.ts
import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs"; // needed for sharp on Vercel

const TOPS = new Set(["experience", "projects", "standalone"] as const);
type Top = "experience" | "projects" | "standalone";

function cleanSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const topRaw = (form.get("top") as string) || "experience";
  const slugRaw = (form.get("slug") as string) || "";
  const indexMode = ((form.get("indexMode") as string) || "auto").toLowerCase();
  const manualIndex = parseInt((form.get("index") as string) || "1", 10);

  if (!file) return NextResponse.json({ error: "missing file" }, { status: 400 });
  if (!slugRaw) return NextResponse.json({ error: "missing slug" }, { status: 400 });

  const top = TOPS.has(topRaw as Top) ? (topRaw as Top) : "experience";
  const slug = cleanSlug(slugRaw);
  if (!slug) return NextResponse.json({ error: "bad slug" }, { status: 400 });

  const inputBuf = Buffer.from(await file.arrayBuffer());
  let pngBuf: Buffer;
  try {
    pngBuf = await sharp(inputBuf).png({ quality: 90 }).toBuffer();
  } catch (e: any) {
    return NextResponse.json({ error: "failed to convert image" }, { status: 400 });
  }

  const folder = `images/${top}/${slug}`;
  let idx = Number.isFinite(manualIndex) ? manualIndex : 1;

  if (indexMode === "auto") {
    const { data: list, error: listErr } = await supabase.storage
      .from("public-images")
      .list(folder, { limit: 100 });

    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

    const taken = new Set((list ?? []).map(o => o.name)); 
    let i = 1;
    while (taken.has(`${slug}-${i}.png`)) i++;
    idx = i;
  }

  const path = `${folder}/${slug}-${idx}.png`;

  // --- Upload to Supabase Storage ---
  const { error: upErr } = await supabase.storage
    .from("public-images")
    .upload(path, pngBuf, {
      contentType: "image/png",
      upsert: true,
    });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // --- Return public URL + path ---
  const { data: pub } = supabase.storage.from("public-images").getPublicUrl(path);

  return NextResponse.json({ path, url: pub.publicUrl });
}
