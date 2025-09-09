"use client";
import type { Block, AnimationSettings, WithAnim } from "@/lib/blocks";

export default function AnimationPanel({
  block,
  onChange,
}: {
  block: Block;
  onChange: (b: Block) => void;
}) {
  const data = block.data as WithAnim;
  const set = (patch: Partial<WithAnim["_anim"]> | undefined) =>
    onChange({
      ...block,
      data: {
        ...(block.data as object),
        _anim: patch ? { ...(data._anim ?? {}), ...patch } : undefined,
      } as any,
    });

  return (
    <div className="rounded border p-3">
      <div className="mb-2 text-sm font-medium text-black">Animation</div>
      <div className="grid gap-2 md:grid-cols-3">
        <label className="text-sm text-black flex flex-col gap-1">
          Preset
          <select
            className="rounded border p-2 text-black"
            value={data._anim?.type ?? ""}
            onChange={(e) => {
              const type = e.target.value as AnimationSettings["type"] | "";
              set(type ? { type } : undefined);
            }}
          >
            <option value="">None</option>
            <option value="slideInLeft">Slide in left</option>
            <option value="slideInRight">Slide in right</option>
            <option value="slideInTop">Slide in top</option>
            <option value="slideInBottom">Slide in bottom</option>
            <option value="fadeIn">Fade in</option>
          </select>
        </label>
        <label className="text-sm text-black flex flex-col gap-1">
          Duration (ms)
          <input
            type="number"
            min={0}
            className="rounded border p-2 text-black"
            value={data._anim?.durationMs ?? 600}
            onChange={(e) => set({ durationMs: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm text-black flex flex-col gap-1">
          Delay (ms)
          <input
            type="number"
            min={0}
            className="rounded border p-2 text-black"
            value={data._anim?.delayMs ?? 0}
            onChange={(e) => set({ delayMs: Number(e.target.value) })}
          />
        </label>
      </div>
      <div className="mt-1 text-xs text-neutral-500">
        Leave “Preset” blank to disable.
      </div>
    </div>
  );
}
