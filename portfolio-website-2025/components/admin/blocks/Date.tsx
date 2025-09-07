"use client";
import type { Block, DateData } from "@/lib/blocks/types";
import { isDateData } from "@/lib/blocks/types";

export default function DateEditor({
  block,
  onChange,
}: { block: Block; onChange: (b: Block) => void }) {
  if (!isDateData(block)) return null;
  return (
    <div className="space-y-2">
      <input
        className="w-full rounded border p-2 text-black"
        value={block.data.text}
        onChange={(e) => onChange({ ...block, data: { ...block.data, text: e.target.value } as DateData })}
        placeholder="Month Year - Month Year"
      />
      <label className="text-sm text-black flex items-center gap-2">
        Align:
        <select
          className="rounded border p-1 text-black"
          value={block.data.align ?? "right"}
          onChange={(e) =>
            onChange({ ...block, data: { ...block.data, align: e.target.value as DateData["align"] } as DateData })
          }
        >
          <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
        </select>
      </label>
      <div className="text-xs text-neutral-500">Renders in red italics.</div>
    </div>
  );
}
