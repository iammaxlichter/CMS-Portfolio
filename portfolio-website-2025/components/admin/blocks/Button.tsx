"use client";
import type { Block } from "@/lib/blocks";
import { isButtonData } from "@/lib/blocks";

export default function ButtonEditor({
  block,
  onChange,
}: { block: Block; onChange: (b: Block) => void }) {
  if (!isButtonData(block)) return null;
  return (
    <div className="space-y-2">
      <input
        className="w-full rounded border p-2 text-black"
        value={block.data.text}
        onChange={(e) => onChange({ ...block, data: { ...block.data, text: e.target.value } })}
        placeholder="Button label (e.g., View Project)"
      />
      <input
        className="w-full rounded border p-2 text-black"
        value={block.data.href}
        onChange={(e) => onChange({ ...block, data: { ...block.data, href: e.target.value } })}
        placeholder="Link (e.g., /projects/mymuse or https://...)"
      />
      <label className="text-sm text-black flex items-center gap-2">
        Style:
        <select
          className="rounded border p-2 text-black"
          value={block.data.variant ?? "outline"}
          onChange={(e) =>
            onChange({ ...block, data: { ...block.data, variant: e.target.value as "outline" | "solid" } })
          }
        >
          <option value="outline">Outline (red border, transparent)</option>
          <option value="solid">Solid (red fill, white text)</option>
        </select>
      </label>
      <div className="grid gap-2 md:grid-cols-2">
        {(["paddingTop","paddingBottom"] as const).map((k) => (
          <label key={k} className="text-sm text-black flex flex-col gap-1">
            {k.replace("padding","Padding ")} (px)
            <input
              type="number"
              className="rounded border p-2 text-black"
              value={(block.data as any)[k] ?? 0}
              onChange={(e) => onChange({ ...block, data: { ...block.data, [k]: Number(e.target.value) } as any })}
            />
          </label>
        ))}
      </div>
      <div className="text-xs text-neutral-500">
        Outline uses <code>#9D231B</code> for border/text; Solid uses <code>#9D231B</code> with <code>#FBFBFB</code>.
      </div>
    </div>
  );
}
