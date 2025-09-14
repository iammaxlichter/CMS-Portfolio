// components/admin/blocks/SlideshowEditor.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Block } from "@/lib/blocks";
import type { SlideshowData } from "@/lib/blocks";

export default function SlideshowEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (b: Block) => void;
}) {
  const data = useMemo<SlideshowData>(() => {
    const d = (block.data || {}) as Partial<SlideshowData>;
    return {
      paths: d.paths ?? [],
      displayMaxWidth: d.displayMaxWidth ?? 1200,
      align: d.align ?? "left",
      marginTop: d.marginTop ?? 16,
      marginBottom: d.marginBottom ?? 16,
      aspectRatio: d.aspectRatio ?? "16/9",
      fixedHeightPx: d.fixedHeightPx,
      borderWidthPx: d.borderWidthPx ?? 0,
      borderColor: d.borderColor ?? "#343330",
      paddingPx: d.paddingPx ?? 0,
    };
  }, [block.data]);

  const [rawPaths, setRawPaths] = useState<string>(() => (data.paths ?? []).join("\n"));

  useEffect(() => {
    setRawPaths((data.paths ?? []).join("\n"));
  }, [data.paths]);

  const set = (patch: Partial<SlideshowData>) =>
    onChange({ ...block, data: { ...data, ...patch } });

  return (
    <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
      <label className="text-sm">
        <div className="mb-1 font-medium">Image paths (one per line)</div>
        <textarea
          className="w-full rounded border p-2 bg-white"
          rows={4}
          value={rawPaths}
          onChange={(e) => setRawPaths(e.currentTarget.value)}
          onBlur={(e) =>
            set({
              paths: e.currentTarget.value
                .split(/\r?\n/)
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          onKeyDownCapture={(e) => e.stopPropagation()}
          onPointerDownCapture={(e) => e.stopPropagation()}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <div className="mb-1 font-medium">Max width (px)</div>
          <input
            type="number"
            className="w-full rounded border p-2 bg-white"
            value={data.displayMaxWidth ?? 1200}
            onChange={(e) => set({ displayMaxWidth: Number(e.currentTarget.value) })}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 font-medium">Align</div>
          <select
            className="w-full rounded border p-2 bg-white"
            value={data.align ?? "left"}
            onChange={(e) => set({ align: e.currentTarget.value as SlideshowData["align"] })}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>

        <label className="text-sm">
          <div className="mb-1 font-medium">Aspect ratio</div>
          <input
            className="w-full rounded border p-2 bg-white"
            value={data.aspectRatio ?? "16/9"}
            onChange={(e) => set({ aspectRatio: e.currentTarget.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 font-medium">Fixed height (px, optional)</div>
          <input
            type="number"
            className="w-full rounded border p-2 bg-white"
            value={data.fixedHeightPx ?? ""}
            onChange={(e) =>
              set({ fixedHeightPx: e.currentTarget.value ? Number(e.currentTarget.value) : undefined })
            }
            placeholder="Leave blank to use aspect-ratio"
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 font-medium">Padding (px)</div>
          <input
            type="number"
            className="w-full rounded border p-2 bg-white"
            value={data.paddingPx ?? 0}
            onChange={(e) => set({ paddingPx: Number(e.currentTarget.value) })}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 font-medium">Border width (px)</div>
          <input
            type="number"
            className="w-full rounded border p-2 bg-white"
            value={data.borderWidthPx ?? 0}
            onChange={(e) => set({ borderWidthPx: Number(e.currentTarget.value) })}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        </label>

        <label className="text-sm col-span-2">
          <div className="mb-1 font-medium">Border color</div>
          <input
            className="w-full rounded border p-2 bg-white"
            value={data.borderColor ?? "#343330"}
            onChange={(e) => set({ borderColor: e.currentTarget.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        </label>
      </div>
    </form>
  );
}
