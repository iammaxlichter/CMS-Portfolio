"use client";
import type { Block } from "@/lib/blocks";
import { isImageData } from "@/lib/blocks";

export default function ImageEditor({
  block,
  onChange,
}: { block: Block; onChange: (b: Block) => void }) {
  if (!isImageData(block)) return null;
  return (
    <div className="space-y-2">
      <input
        className="w-full rounded border p-2 text-black"
        value={block.data.path}
        onChange={(e) => onChange({ ...block, data: { ...block.data, path: e.target.value } })}
        placeholder="Storage path (e.g. uploads/hero.png)"
      />
      <input
        className="w-full rounded border p-2 text-black"
        value={block.data.alt}
        onChange={(e) => onChange({ ...block, data: { ...block.data, alt: e.target.value } })}
        placeholder="Alt text (also used as caption)"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <label className="text-sm text-black flex flex-col gap-1">
          Display max width (px)
          <input
            type="number"
            min={200}
            className="rounded border p-2 text-black"
            value={block.data.displayMaxWidth ?? 1200}
            onChange={(e) =>
              onChange({ ...block, data: { ...block.data, displayMaxWidth: Number(e.target.value) || 0 } })
            }
          />
        </label>

        <label className="text-sm text-black flex flex-col gap-1">
          Align
          <select
            className="rounded border p-2 text-black"
            value={block.data.align ?? "left"}
            onChange={(e) =>
              onChange({ ...block, data: { ...block.data, align: e.target.value as "left"|"center"|"right" } })
            }
          >
            <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
          </select>
        </label>

        <label className="text-sm text-black flex flex-col gap-1">
          Caption align
          <select
            className="rounded border p-2 text-black"
            value={block.data.captionAlign ?? "left"}
            onChange={(e) =>
              onChange({ ...block, data: { ...block.data, captionAlign: e.target.value as "left"|"center"|"right" } })
            }
          >
            <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="text-sm text-black flex flex-col gap-1">
          Intrinsic width (px)
          <input
            type="number"
            className="rounded border p-2 text-black"
            value={block.data.intrinsicWidth ?? 1600}
            onChange={(e) =>
              onChange({ ...block, data: { ...block.data, intrinsicWidth: Number(e.target.value) || undefined } })
            }
          />
        </label>
        <label className="text-sm text-black flex flex-col gap-1">
          Intrinsic height (px)
          <input
            type="number"
            className="rounded border p-2 text-black"
            value={block.data.intrinsicHeight ?? 900}
            onChange={(e) =>
              onChange({ ...block, data: { ...block.data, intrinsicHeight: Number(e.target.value) || undefined } })
            }
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {["marginTop","marginBottom","captionMarginTop","captionMarginBottom"].map((k) => (
          <label key={k} className="text-sm text-black flex flex-col gap-1">
            {k.replace(/([A-Z])/g," $1")} (px)
            <input
              type="number"
              className="rounded border p-2 text-black"
              value={(block.data as any)[k] ?? (k.includes("Top")?16:4)}
              onChange={(e) => onChange({ ...block, data: { ...block.data, [k]: Number(e.target.value) } as any })}
            />
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="text-sm text-black flex flex-col gap-1">
          Border width (px)
          <input
            type="number"
            min={0}
            className="rounded border p-2 text-black"
            value={block.data.borderWidthPx ?? 0}
            onChange={(e) => onChange({ ...block, data: { ...block.data, borderWidthPx: Number(e.target.value) } })}
          />
        </label>
        <label className="text-sm text-black flex flex-col gap-1">
          Border color
          <input
            type="text"
            className="rounded border p-2 text-black"
            value={block.data.borderColor ?? "#343330"}
            onChange={(e) => onChange({ ...block, data: { ...block.data, borderColor: e.target.value || "#343330" } })}
            placeholder="#343330"
          />
        </label>
        <label className="text-sm text-black flex flex-col gap-1">
          Padding inside border (px)
          <input
            type="number"
            min={0}
            className="rounded border p-2 text-black"
            value={block.data.paddingPx ?? 0}
            onChange={(e) => onChange({ ...block, data: { ...block.data, paddingPx: Number(e.target.value) || 0 } })}
          />
        </label>
      </div>
    </div>
  );
}
