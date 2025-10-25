// lib/helpers/images.ts
export function toImageSrc(p: string) {
  if (!p) return "";
  let s = p.trim();

  if (/^https?:\/\//i.test(s)) return s;
  if (!s.startsWith("/")) s = "/" + s;
  if (s.startsWith("/images/")) return s;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BUCKET ?? "public-images";
  return `${base}/storage/v1/object/public/${bucket}/${s.replace(/^\/+/, "")}`;
}
