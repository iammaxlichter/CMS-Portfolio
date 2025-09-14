"use client";
import type { Block, CardGridData, CardItem } from "@/lib/blocks";

export default function CardGridEditor({
  block,
  onChange,
}: { block?: Block; onChange: (b: Block) => void }) {
  if (!block || block.block_type !== "card_grid") return null;

  const data = block.data as CardGridData;
  const items = data.items ?? [];

  const set = (next: Partial<CardGridData>) =>
    onChange({ ...block, data: { ...data, ...next } });

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded border p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className="rounded border p-2 text-black"
              value={it.title}
              placeholder="Card title"
              onChange={(e) => {
                const arr = [...items];
                arr[i] = { ...it, title: e.target.value };
                set({ items: arr });
              }}
            />
            <input
              className="rounded border p-2 text-black"
              value={it.href}
              placeholder="Link (/slug or https://...)"
              onChange={(e) => {
                const arr = [...items];
                arr[i] = { ...it, href: e.target.value };
                set({ items: arr });
              }}
            />
            <input
              className="rounded border p-2 text-black md:col-span-2"
              value={it.img}
              placeholder="Thumbnail"
              onChange={(e) => {
                const arr = [...items];
                arr[i] = { ...it, img: e.target.value };
                set({ items: arr });
              }}
            />
            <input
              className="rounded border p-2 text-black md:col-span-2"
              value={it.caption ?? ""}
              placeholder="Optional caption"
              onChange={(e) => {
                const arr = [...items];
                arr[i] = { ...it, caption: e.target.value };
                set({ items: arr });
              }}
            />
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <label className="text-sm text-black flex flex-col gap-1">
              Align (card)
              <select
                className="rounded border p-2 text-black"
                value={it.align ?? "left"}
                onChange={(e) => {
                  const arr = [...items];
                  arr[i] = { ...it, align: e.target.value as "left" | "center" | "right" };
                  set({ items: arr });
                }}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>

            <label className="text-sm text-black flex flex-col gap-1">
              Card width (%)
              <input
                type="number"
                min={10}
                max={100}
                className="rounded border p-2 text-black"
                value={it.widthPercent ?? ""}
                placeholder="100"
                onChange={(e) => {
                  const arr = [...items];
                  if (e.target.value === "") {
                    arr[i] = { ...it, widthPercent: undefined };
                  } else {
                    // Store the raw value, let the user type freely
                    const raw = Number(e.target.value);
                    arr[i] = { ...it, widthPercent: raw || undefined };
                  }
                  set({ items: arr });
                }}
                onBlur={(e) => {
                  // Apply constraints only on blur (when user finishes typing)
                  if (e.target.value !== "") {
                    const arr = [...items];
                    const v = Math.max(10, Math.min(100, Number(e.target.value) || 100));
                    arr[i] = { ...it, widthPercent: v };
                    set({ items: arr });
                  }
                }}
              />
            </label>

            <label className="text-sm text-black flex flex-col gap-1">
              img mw (px)
              <input
                type="number"
                min={0}
                className="rounded border p-2 text-black"
                value={it.thumbMaxWidthPx ?? ""}
                placeholder="Auto"
                onChange={(e) => {
                  const arr = [...items];
                  if (e.target.value === "") {
                    arr[i] = { ...it, thumbMaxWidthPx: undefined };
                  } else {
                    // Store the raw value, let the user type freely
                    const raw = Number(e.target.value);
                    arr[i] = { ...it, thumbMaxWidthPx: raw || undefined };
                  }
                  set({ items: arr });
                }}
                onBlur={(e) => {
                  // Apply the 80px minimum only on blur
                  if (e.target.value !== "") {
                    const arr = [...items];
                    const raw = Number(e.target.value);
                    const v = raw < 80 ? undefined : raw;
                    arr[i] = { ...it, thumbMaxWidthPx: v };
                    set({ items: arr });
                  }
                }}
              />
            </label>

            {["borderWidthPx", "borderColor", "paddingPx"].map((k) => (
              <label key={k} className="text-sm text-black flex flex-col gap-1">
                {k === "borderColor"
                  ? "Border color"
                  : k === "paddingPx"
                    ? "Padding in border px"
                    : "Border px"}
                <input
                  type={k === "borderColor" ? "text" : "number"}
                  min={k === "borderColor" ? undefined : 0}
                  className="rounded border p-2 text-black"
                  value={(it as any)[k] ?? ""}
                  placeholder={
                    k === "borderColor"
                      ? data.borderColor ?? "#343330"
                      : k === "paddingPx"
                        ? String(data.paddingPx ?? 0)
                        : String(data.borderWidthPx ?? 0)
                  }
                  onChange={(e) => {
                    const arr = [...items];
                    if (k === "borderColor") {
                      (arr[i] as any)[k] = e.target.value; // allow empty to fall back to grid default
                    } else {
                      if (e.target.value === "") {
                        (arr[i] as any)[k] = undefined;
                      } else {
                        (arr[i] as any)[k] = Number(e.target.value) || 0;
                      }
                    }
                    set({ items: arr });
                  }}
                />
              </label>
            ))}
          </div>

          <div className="mt-2 grid gap-2 md:grid-cols-4">
            {(["marginTop", "marginBottom", "marginLeft", "marginRight"] as const).map((k) => (
              <label key={k} className="text-sm text-black flex flex-col gap-1">
                {k.replace(/([A-Z])/g, " $1")} (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={(it as any)[k] ?? ""}
                  placeholder="0"
                  onChange={(e) => {
                    const arr = [...items];
                    if (e.target.value === "") {
                      (arr[i] as any)[k] = undefined;
                    } else {
                      (arr[i] as any)[k] = Number(e.target.value) || 0;
                    }
                    set({ items: arr });
                  }}
                />
              </label>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="rounded border px-2 text-sm"
              onClick={() => {
                const arr = [...items];
                if (i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                set({ items: arr });
              }}
            >
              ↑
            </button>
            <button
              type="button"
              className="rounded border px-2 text-sm"
              onClick={() => {
                const arr = [...items];
                if (i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                set({ items: arr });
              }}
            >
              ↓
            </button>
            <button
              type="button"
              className="rounded border px-2 text-sm text-red-600"
              onClick={() => {
                const arr = [...items];
                arr.splice(i, 1);
                set({ items: arr });
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
        onClick={() =>
          set({
            items: [
              ...items,
              {
                title: "",
                href: "",
                img: "",
                caption: "",
                widthPercent: 100,
              } as CardItem,
            ],
          })
        }
      >
        + Add card
      </button>

      <div className="text-xs text-neutral-500">
        Cards render in a responsive grid and link to the provided URL. Per-item overrides take precedence over grid defaults.
      </div>
    </div>
  );
}