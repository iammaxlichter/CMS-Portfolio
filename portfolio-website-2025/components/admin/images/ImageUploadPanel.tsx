"use client";

import { useEffect, useMemo, useState } from "react";

type Info = {
  items: { source: "repo" | "bucket"; name: string; url: string; index: number }[];
  nextIndex: number;
};

export default function ImageUploadPanel() {
  const [top, setTop] = useState<"experience" | "projects" | "standalone">("experience");
  const [slug, setSlug] = useState("");
  const [indexMode, setIndexMode] = useState<"auto" | "manual">("auto");
  const [index, setIndex] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ path: string; url: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<Info | null>(null);

  // Debounced lookup for existing images
  useEffect(() => {
    const s = slug.trim().toLowerCase();
    if (!s) { setInfo(null); return; }
    const handle = setTimeout(() => {
      const params = new URLSearchParams({ top, slug: s });
      fetch(`/api/list-images?${params.toString()}`)
        .then(r => r.json())
        .then(setInfo)
        .catch(() => setInfo(null));
    }, 500);
    return () => clearTimeout(handle);
  }, [top, slug]);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setResult(null);
    if (!file || !slug) { setErr("Choose a file and enter a slug."); return; }
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("top", top);
    fd.append("slug", slug.trim().toLowerCase());
    fd.append("indexMode", indexMode);
    fd.append("index", String(index));
    const res = await fetch("/api/upload-image", { method: "POST", body: fd });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { setErr(json.error || "Upload failed"); return; }
    setResult(json);
    // refresh info after upload
    const params = new URLSearchParams({ top, slug: slug.trim().toLowerCase() });
    fetch(`/api/list-images?${params.toString()}`).then(r => r.json()).then(setInfo).catch(() => {});
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-6">
        {/* Top row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium text-black">Section</div>
            <div className="flex flex-wrap gap-3 text-sm">
              {(["experience", "projects", "standalone"] as const).map(v => (
                <label key={v} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="top"
                    className="accent-black"
                    checked={top === v}
                    onChange={() => setTop(v)}
                  />
                  <span className="capitalize">{v}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Slug</label>
            <input
              placeholder="e.g. ayoka-systems"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            {info && (
              <div className="text-xs text-neutral-600">
                Found {info.items.length} image{info.items.length !== 1 ? "s" : ""} across repo + bucket.{" "}
                Next index: <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-semibold">{info.nextIndex}</span>
              </div>
            )}
          </div>
        </div>

        {/* Index controls */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-black">Indexing</div>
          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="idx"
                className="accent-black"
                checked={indexMode === "auto"}
                onChange={() => setIndexMode("auto")}
              />
              Auto
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="idx"
                className="accent-black"
                checked={indexMode === "manual"}
                onChange={() => setIndexMode("manual")}
              />
              Manual
            </label>
            {indexMode === "manual" && (
              <input
                type="number"
                min={1}
                value={index}
                onChange={(e) => setIndex(parseInt(e.target.value || "1", 10))}
                className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
            )}
          </div>
        </div>

        {/* File + preview */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="space-y-2">
            <div className="text-sm font-medium text-black">Image file</div>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-200 file:px-3 file:py-2 file:text-black hover:file:bg-neutral-300"
            />
            <p className="text-xs text-neutral-500">
              JPG/JPEG will be converted to PNG and saved under <code>images/{top}/{slug || "<slug>"}/</code>.
            </p>
          </div>

          {previewUrl && (
            <div className="justify-self-end">
              <div className="text-xs mb-1 text-neutral-600">Preview</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="preview"
                className="h-24 w-24 rounded-lg border border-neutral-200 object-cover"
              />
            </div>
          )}
        </div>

        {/* Actions + results */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={busy}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Upload"}
          </button>

          {err && <span className="text-sm text-red-600">{err}</span>}

          {result && (
            <div className="ml-auto text-xs text-neutral-700">
              <div>
                Uploaded: <code className="rounded bg-neutral-100 px-1.5 py-0.5">{result.path}</code>
              </div>
              <a className="underline" href={result.url} target="_blank" rel="noreferrer">
                Open image
              </a>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
