// lib/helpers/images.ts
export function toImageSrc(src: string) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return src.startsWith("/") ? src : `/${src}`;
}
