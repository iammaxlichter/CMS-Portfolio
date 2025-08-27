"use client";
import { useState } from "react";
import type { Block, GalleryData, GalleryItem } from "@/lib/blocks/types";


type GalleryBlock = Omit<Block, "block_type" | "data"> & {
  block_type: "gallery";
  data: GalleryData;
};

export default function GalleryEditor({
  block,
  onChange,
}: {
  block: GalleryBlock;
  onChange: (b: Block) => void;
}) {
    
  // normalize to items
    const items: GalleryItem[] =
    Array.isArray(block.data.items) && block.data.items.length
        ? (block.data.items as GalleryItem[])
        : (block.data.paths ?? []).map((p: string): GalleryItem => ({ path: p }));


   const updateItems = (next: GalleryItem[]) =>
    onChange({
      ...block,
      data: {
        ...(block.data as any),
        items: next,
        cols: ("cols" in block.data && block.data.cols) || 3,
        gap: ("gap" in block.data && block.data.gap) || 12,
      } as GalleryData,
    });

  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {/* gallery grid opts */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-black flex items-center gap-2">
          Columns:
          <select
            className="rounded border p-1 text-black"
            value={("cols" in block.data && block.data.cols) || 3}
            onChange={(e) => onChange({ ...block, data: { ...(block.data as any), items, cols: Number(e.target.value) as 2 | 3 } })}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </label>
        <label className="text-sm text-black flex items-center gap-2">
          Gap (px):
          <input
            type="number"
            className="w-20 rounded border p-1 text-black"
            value={(("gap" in block.data && block.data.gap) || 12)}
            onChange={(e) => onChange({ ...block, data: { ...(block.data as any), items, gap: Number(e.target.value) || 0 } })}
          />
        </label>
      </div>

      {/* items */}
      {items.map((it, i) => (
        <div key={i} className="rounded border p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className="rounded border p-2 text-black"
              value={it.path}
              onChange={(e) => {
                const next = [...items]; next[i] = { ...it, path: e.target.value };
                updateItems(next);
              }}
              placeholder="uploads/img.png or https://..."
            />
            <input
              className="rounded border p-2 text-black"
              value={it.alt ?? ""}
              onChange={(e) => {
                const next = [...items]; next[i] = { ...it, alt: e.target.value };
                updateItems(next);
              }}
              placeholder="Alt / caption"
            />
          </div>

          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {open === i ? "Hide advanced" : "Show advanced"}
          </button>

          {open === i && (
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              <label className="text-sm text-black flex flex-col gap-1">
                Image align
                <select
                  className="rounded border p-2 text-black"
                  value={it.align ?? "left"}
                  onChange={(e) => {
                    const next = [...items]; next[i] = { ...it, align: e.target.value as GalleryItem["align"] };
                    updateItems(next);
                  }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>

              <label className="text-sm text-black flex flex-col gap-1">
                Caption align
                <select
                  className="rounded border p-2 text-black"
                  value={it.captionAlign ?? "left"}
                  onChange={(e) => {
                    const next = [...items]; next[i] = { ...it, captionAlign: e.target.value as GalleryItem["captionAlign"] };
                    updateItems(next);
                  }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>

              <label className="text-sm text-black flex flex-col gap-1">
                Width (%)
                <input
                  type="number"
                  min={10}
                  max={100}
                  className="rounded border p-2 text-black"
                  value={it.widthPercent ?? 100}
                  onChange={(e) => {
                    const v = Math.max(10, Math.min(100, Number(e.target.value) || 100));
                    const next = [...items]; next[i] = { ...it, widthPercent: v };
                    updateItems(next);
                  }}
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
              <label className="text-sm text-black flex flex-col gap-1">
                MT (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={it.marginTop ?? 0}
                  onChange={(e) => { const next = [...items]; next[i] = { ...it, marginTop: Number(e.target.value) || 0 }; updateItems(next); }}
                />
              </label>
              <label className="text-sm text-black flex flex-col gap-1">
                MB (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={it.marginBottom ?? 0}
                  onChange={(e) => { const next = [...items]; next[i] = { ...it, marginBottom: Number(e.target.value) || 0 }; updateItems(next); }}
                />
              </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-sm text-black flex flex-col gap-1">
                  ML (px)
                  <input
                    type="number"
                    className="rounded border p-2 text-black"
                    value={it.marginLeft ?? 0}
                    onChange={(e) => { const next = [...items]; next[i] = { ...it, marginLeft: Number(e.target.value) || 0 }; updateItems(next); }}
                  />
                </label>
                <label className="text-sm text-black flex flex-col gap-1">
                  MR (px)
                  <input
                    type="number"
                    className="rounded border p-2 text-black"
                    value={it.marginRight ?? 0}
                    onChange={(e) => { const next = [...items]; next[i] = { ...it, marginRight: Number(e.target.value) || 0 }; updateItems(next); }}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="mt-10 flex gap-2">
            <button
              type="button"
              className="rounded border px-2 text-sm"
              onClick={() => {
                const next = [...items];
                if (i > 0) [next[i - 1], next[i]] = [next[i], next[i - 1]];
                updateItems(next);
              }}
            >
              ↑
            </button>
            <button
              type="button"
              className="rounded border px-2 text-sm"
              onClick={() => {
                const next = [...items];
                if (i < next.length - 1) [next[i + 1], next[i]] = [next[i], next[i + 1]];
                updateItems(next);
              }}
            >
              ↓
            </button>
            <button
              type="button"
              className="rounded border px-2 text-sm text-red-600"
              onClick={() => {
                const next = [...items]; next.splice(i, 1); updateItems(next);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="rounded border px-3 py-2 text-sm"
        onClick={() => updateItems([...(items || []), { path: "", alt: "" }])}
      >
        + Add image
      </button>

      <div className="text-xs text-neutral-500">
        Each image can set alignment, caption alignment, width (% of its grid cell), and margins.
      </div>
    </div>
  );
}
