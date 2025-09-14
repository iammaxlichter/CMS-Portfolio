// app/api/list-images/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Top = "experience" | "projects" | "standalone";
const TOPS = new Set(["experience","projects","standalone"] as const);

// matches slug-<number>.(png|jpg|jpeg|webp|avif)
function parseIndex(name: string, slug: string) {
  const m = name.match(new RegExp(`^${slug}-(\\d+)\\.(?:png|jpg|jpeg|webp|avif)$`, "i"));
  return m ? parseInt(m[1], 10) : null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const top = (url.searchParams.get("top") || "experience") as Top;
  const slug = (url.searchParams.get("slug") || "").trim().toLowerCase();

  if (!TOPS.has(top) || !slug) {
    return NextResponse.json({ error: "bad params" }, { status: 400 });
  }

  const folderRel = `images/${top}/${slug}`;

  const repoDir = path.join(process.cwd(), "public", folderRel);
  let repoFiles: string[] = [];
  try {
    repoFiles = fs.readdirSync(repoDir);
  } catch {  }

  const repoItems = repoFiles
    .filter(f => parseIndex(f, slug) !== null)
    .map(f => ({
      source: "repo" as const,
      name: f,
      url: `/${folderRel}/${f}`,
      index: parseIndex(f, slug)!,
    }));

  const supabase = await createClient();
  const { data: list, error: listErr } = await supabase.storage
    .from("public-images")
    .list(folderRel, { limit: 100 });

  if (listErr && listErr.message !== "The resource was not found") {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  const { data: pubRoot } = supabase.storage.from("public-images").getPublicUrl(folderRel + "/");

  const bucketItems = (list ?? [])
    .filter(o => parseIndex(o.name, slug) !== null)
    .map(o => ({
      source: "bucket" as const,
      name: o.name,
      url: pubRoot.publicUrl.replace(/\/$/, "") + "/" + o.name,
      index: parseIndex(o.name, slug)!,
    }));

  const all = [...repoItems, ...bucketItems];
  const taken = new Set(all.map(i => i.index));
  let nextIndex = 1;
  while (taken.has(nextIndex)) nextIndex++;

  return NextResponse.json({ items: all, nextIndex });
}
