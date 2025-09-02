// components/admin/BlockEditor.tsx
"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/lib/supabase/client";

// Types (updated import path)
import type {
  Block,
  BlockType,
  ColumnsData,
  Slot,
  TitleData,
  SubtitleData,
  VideoData,
  ButtonData,
  SlideshowData,
  DateData,
  CardGridData,
  CardItem,
} from "@/lib/blocks/types";

import {
  isTitleData,
  isSubtitleData,
  isParagraphData,
  isImageData,
  isGalleryData,
  isVideoData,
  isColumnsData,
  isButtonData,
  isSlideshowData,
  isDateData,
  isCardGridData,
} from "@/lib/blocks/types";

import Paragraph from "@/components/admin/blocks/Paragraph";
import { DefaultData } from "@/lib/blocks/types";
import GalleryEditor from "@/components/admin/blocks/Gallery";
import type { AnimationSettings, WithAnim } from "@/lib/blocks/types";

/* ------------------------------ Helpers ------------------------------ */

type ContainerId = "root" | `col-left:${string}` | `col-right:${string}`;

function containerIdFor(b: Block): ContainerId {
  if (!b.parent_id) return "root";
  return b.slot === "left"
    ? (`col-left:${b.parent_id}` as const)
    : (`col-right:${b.parent_id}` as const);
}

function parseContainerId(id: ContainerId): {
  parent_id: string | null;
  slot: Slot;
} {
  if (id === "root") return { parent_id: null, slot: null };
  const [side, parent] = id.split(":");
  return {
    parent_id: parent,
    slot: side === "col-left" ? "left" : "right",
  };
}

function groupIntoContainers(blocks: Block[]) {
  const map = new Map<ContainerId, Block[]>();
  map.set("root", []);
  for (const b of blocks) {
    const cid = containerIdFor(b);
    if (!map.has(cid)) map.set(cid, []);
    map.get(cid)!.push(b);
  }
  for (const arr of map.values()) arr.sort((a, b) => a.position - b.position);
  return map;
}

// fractional positioning between neighbors
function between(prev?: number, next?: number) {
  if (prev == null && next == null) return 1000;
  if (prev == null) return next! - 1000;
  if (next == null) return prev + 1000;
  return (prev + next) / 2;
}

/* ------------------------------ UI Bits ------------------------------ */

function useDebounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  ms: number
) {
  return useMemo(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    return (...args: Args) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }, [fn, ms]);
}

function DropZone({ id }: { id: ContainerId }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className="min-h-0" />;
}

function SortableItem({
  block,
  onChange,
  onDelete,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id, data: { block } });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const debounced = useDebounce(onChange, 300);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span
          className="cursor-grab select-none"
          {...attributes}
          {...listeners}
        >
          ↕ Drag
        </span>
        <button type="button" onClick={onDelete} className="text-red-600">
          Delete
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {block.block_type === "title" && isTitleData(block) && (
          <>
            <input
              className="w-full rounded border p-2 text-xl font-bold text-black"
              value={block.data.text}
              onChange={(e) =>
                debounced({
                  ...block,
                  data: { ...block.data, text: e.target.value } as TitleData,
                })
              }
              placeholder="Page title"
            />
            <div className="text-xs text-neutral-400">
              This will render as an H1.
            </div>
          </>
        )}

        {block.block_type === "subtitle" && isSubtitleData(block) && (
          <input
            className="w-full rounded border p-2 text-lg text-black"
            value={block.data.text}
            onChange={(e) =>
              debounced({
                ...block,
                data: { ...block.data, text: e.target.value } as SubtitleData,
              })
            }
            placeholder="Subtitle"
          />
        )}

        {block.block_type === "paragraph" && isParagraphData(block) && (
          <Paragraph block={block} onChange={debounced} />
        )}

        {block.block_type === "image" && isImageData(block) && (
          <div className="space-y-2">
            <input
              className="w-full rounded border p-2 text-black"
              value={block.data.path}
              onChange={(e) =>
                debounced({
                  ...block,
                  data: { ...block.data, path: e.target.value },
                })
              }
              placeholder="Storage path (e.g. uploads/hero.png)"
            />

            <input
              className="w-full rounded border p-2 text-black"
              value={block.data.alt}
              onChange={(e) =>
                debounced({
                  ...block,
                  data: { ...block.data, alt: e.target.value },
                })
              }
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
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        displayMaxWidth: Number(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="e.g. 720"
                />
              </label>

              <label className="text-sm text-black flex flex-col gap-1">
                Align
                <select
                  className="rounded border p-2 text-black"
                  value={block.data.align ?? "left"}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        align: e.target.value as "left" | "center" | "right",
                      },
                    })
                  }
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
                  value={block.data.captionAlign ?? "left"}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        captionAlign: e.target.value as
                          | "left"
                          | "center"
                          | "right",
                      },
                    })
                  }
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
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
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        intrinsicWidth: Number(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="e.g. 1600"
                />
              </label>

              <label className="text-sm text-black flex flex-col gap-1">
                Intrinsic height (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={block.data.intrinsicHeight ?? 900}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        intrinsicHeight: Number(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="e.g. 900"
                />
              </label>
            </div>

            <div className="text-xs text-neutral-500">
              <b>Display max width</b> controls how large the image appears on
              the page (it’s still responsive). Intrinsic size helps Next/Image
              pick the right resolution.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="text-sm text-black flex flex-col gap-1">
                Image margin top (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={block.data.marginTop ?? 16}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        marginTop: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
              <label className="text-sm text-black flex flex-col gap-1">
                Image margin bottom (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={block.data.marginBottom ?? 16}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        marginBottom: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
              <label className="text-sm text-black flex flex-col gap-1">
                Caption margin top (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={block.data.captionMarginTop ?? 4}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        captionMarginTop: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
              <label className="text-sm text-black flex flex-col gap-1">
                Caption margin bottom (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={block.data.captionMarginBottom ?? 4}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        captionMarginBottom: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
            </div>
            {/* NEW: Border */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="text-sm text-black flex flex-col gap-1">
                Border width (px)
                <input
                  type="number"
                  min={0}
                  className="rounded border p-2 text-black"
                  value={block.data.borderWidthPx ?? 0}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        borderWidthPx: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
              <label className="text-sm text-black flex flex-col gap-1">
                Border color
                <input
                  type="text"
                  className="rounded border p-2 text-black"
                  value={block.data.borderColor ?? "#343330"}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        borderColor: e.target.value || "#343330",
                      },
                    })
                  }
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
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        paddingPx: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </label>
            </div>
          </div>
        )}
        {block.block_type === "gallery" && isGalleryData(block) && (
          <GalleryEditor block={block} onChange={debounced} />
        )}

        {block.block_type === "video_youtube" && isVideoData(block) && (
          <input
            className="w-full rounded border p-2 text-black"
            value={block.data.url}
            onChange={(e) =>
              debounced({
                ...block,
                data: { ...block.data, url: e.target.value } as VideoData,
              })
            }
            placeholder="YouTube URL"
          />
        )}

        {block.block_type === "button" && isButtonData(block) && (
          <div className="space-y-2">
            <input
              className="w-full rounded border p-2 text-black"
              value={block.data.text}
              onChange={(e) =>
                debounced({
                  ...block,
                  data: { ...block.data, text: e.target.value },
                })
              }
              placeholder="Button label (e.g., View Project)"
            />

            <input
              className="w-full rounded border p-2 text-black"
              value={block.data.href}
              onChange={(e) =>
                debounced({
                  ...block,
                  data: { ...block.data, href: e.target.value },
                })
              }
              placeholder="Link (e.g., /projects/mymuse or https://...)"
            />

            {/* NEW: Variant selector */}
            <label className="text-sm text-black flex items-center gap-2">
              Style:
              <select
                className="rounded border p-2 text-black"
                value={block.data.variant ?? "outline"}
                onChange={(e) =>
                  debounced({
                    ...block,
                    data: {
                      ...block.data,
                      variant: e.target.value as "outline" | "solid",
                    },
                  })
                }
              >
                <option value="outline">
                  Outline (red border, transparent)
                </option>
                <option value="solid">Solid (red fill, white text)</option>
              </select>
            </label>

            <div className="grid gap-2 md:grid-cols-2">
              <label className="text-sm text-black flex flex-col gap-1">
                Padding top (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={block.data.paddingTop ?? 0}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        paddingTop: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
              <label className="text-sm text-black flex flex-col gap-1">
                Padding bottom (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={block.data.paddingBottom ?? 0}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        paddingBottom: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
            </div>

            <div className="text-xs text-neutral-500">
              Outline uses <code>#9D231B</code> for border/text; Solid uses
              <code>#9D231B</code> background with <code>#FBFBFB</code> text.
            </div>
          </div>
        )}

        {block.block_type === "slideshow" && isSlideshowData(block) && (
          <div className="space-y-3">
            {/* Paths editor */}
            {(block.data.paths ?? []).map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 rounded border p-2 text-black"
                  value={p}
                  onChange={(e) => {
                    const paths = [...(block.data.paths ?? [])];
                    paths[i] = e.target.value;
                    debounced({
                      ...block,
                      data: { ...block.data, paths } as SlideshowData,
                    });
                  }}
                  placeholder="uploads/slide-1.jpg or https://..."
                />
                <button
                  type="button"
                  className="rounded border px-2 text-sm"
                  onClick={() => {
                    const paths = [...(block.data.paths ?? [])];
                    paths.splice(i, 1);
                    debounced({
                      ...block,
                      data: { ...block.data, paths } as SlideshowData,
                    });
                  }}
                  aria-label="Remove image"
                >
                  x
                </button>
              </div>
            ))}

            <input
              className="w-full rounded border p-2 text-black"
              placeholder="Type or paste URLs; press Enter to add"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = (e.currentTarget.value || "").trim();
                  if (v) {
                    const paths = [...(block.data.paths ?? []), v];
                    debounced({
                      ...block,
                      data: { ...block.data, paths } as SlideshowData,
                    });
                    e.currentTarget.value = "";
                  }
                }
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (/\r?\n/.test(text)) {
                  e.preventDefault();
                  const lines = text
                    .split(/\r?\n/)
                    .map((s) => s.trim())
                    .filter(Boolean);
                  if (lines.length) {
                    const paths = [...(block.data.paths ?? []), ...lines];
                    debounced({
                      ...block,
                      data: { ...block.data, paths } as SlideshowData,
                    });
                  }
                }
              }}
            />

            {/* Layout controls */}
            <div className="grid gap-2 md:grid-cols-3">
              <label className="text-sm text-black flex flex-col gap-1">
                Display max width (px)
                <input
                  type="number"
                  min={200}
                  className="rounded border p-2 text-black"
                  value={block.data.displayMaxWidth ?? 1200}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...(block.data as SlideshowData),
                        displayMaxWidth: Number(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="e.g. 1200"
                />
              </label>

              <label className="text-sm text-black flex flex-col gap-1">
                Align
                <select
                  className="rounded border p-2 text-black"
                  value={block.data.align ?? "left"}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...(block.data as SlideshowData),
                        align: e.target.value as "left" | "center" | "right",
                      },
                    })
                  }
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>

              <label className="text-sm text-black flex flex-col gap-1">
                Margin top (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={block.data.marginTop ?? 16}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...(block.data as SlideshowData),
                        marginTop: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>

              <label className="text-sm text-black flex flex-col gap-1">
                Margin bottom (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={block.data.marginBottom ?? 16}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...(block.data as SlideshowData),
                        marginBottom: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
            </div>

            {/* Size mode */}
            <div className="grid gap-2 md:grid-cols-2">
              <label className="text-sm text-black flex flex-col gap-1">
                Aspect ratio (e.g., 16/9, 4/3, 1/1)
                <input
                  className="rounded border p-2 text-black"
                  value={block.data.aspectRatio ?? "16/9"}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...(block.data as SlideshowData),
                        aspectRatio: e.target.value,
                        fixedHeightPx: undefined,
                      },
                    })
                  }
                  placeholder="16/9"
                />
              </label>

              <label className="text-sm text-black flex flex-col gap-1">
                OR fixed height (px)
                <input
                  type="number"
                  className="rounded border p-2 text-black"
                  value={block.data.fixedHeightPx ?? ""}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...(block.data as SlideshowData),
                        fixedHeightPx: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                        aspectRatio: undefined,
                      },
                    })
                  }
                  placeholder="e.g. 420"
                />
              </label>
            </div>

            {/* NEW: Border controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="text-sm text-black flex flex-col gap-1">
                Border width (px)
                <input
                  type="number"
                  min={0}
                  className="rounded border p-2 text-black"
                  value={block.data.borderWidthPx ?? 0}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...(block.data as SlideshowData),
                        borderWidthPx: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </label>
              <label className="text-sm text-black flex flex-col gap-1">
                Border color
                <input
                  type="text"
                  className="rounded border p-2 text-black"
                  value={block.data.borderColor ?? "#343330"}
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...(block.data as SlideshowData),
                        borderColor: e.target.value || "#343330",
                      },
                    })
                  }
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
                  onChange={(e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        paddingPx: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </label>
            </div>

            <div className="text-xs text-neutral-500">
              Choose an aspect ratio for responsive height, or set a fixed
              height. Max width, align, margins, and border work like the Image
              block.
            </div>
          </div>
        )}

        {block.block_type === "date" && isDateData(block) && (
          <div className="space-y-2">
            <input
              className="w-full rounded border p-2 text-black"
              value={block.data.text}
              onChange={(e) =>
                debounced({
                  ...block,
                  data: { ...block.data, text: e.target.value } as DateData,
                })
              }
              placeholder="Month Year - Month Year"
            />
            <label className="text-sm text-black flex items-center gap-2">
              Align:
              <select
                className="rounded border p-1 text-black"
                value={block.data.align ?? "right"}
                onChange={(e) =>
                  debounced({
                    ...block,
                    data: {
                      ...block.data,
                      align: e.target.value as DateData["align"],
                    } as DateData,
                  })
                }
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>
            <div className="text-xs text-neutral-500">
              Renders in red italics; use alignment or place inside a right
              column if you prefer.
            </div>
          </div>
        )}

        {block.block_type === "card_grid" && isCardGridData(block) && (
          <div className="space-y-3">
            {(block.data.items ?? []).map((it, i) => (
              <div key={i} className="rounded border p-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    className="rounded border p-2 text-black"
                    value={it.title}
                    placeholder="Card title"
                    onChange={(e) => {
                      const items = [...(block.data.items ?? [])];
                      items[i] = { ...items[i], title: e.target.value };
                      debounced({
                        ...block,
                        data: {
                          ...(block.data as CardGridData),
                          items,
                        } as CardGridData,
                      });
                    }}
                  />
                  <input
                    className="rounded border p-2 text-black"
                    value={it.href}
                    placeholder="Link (/slug or https://...)"
                    onChange={(e) => {
                      const items = [...(block.data.items ?? [])];
                      items[i] = { ...items[i], href: e.target.value };
                      debounced({
                        ...block,
                        data: {
                          ...(block.data as CardGridData),
                          items,
                        } as CardGridData,
                      });
                    }}
                  />

                  <input
                    className="rounded border p-2 text-black md:col-span-2"
                    value={it.img}
                    placeholder="Thumbnail (uploads/thumb.jpg or https://...)"
                    onChange={(e) => {
                      const items = [...(block.data.items ?? [])];
                      items[i] = { ...items[i], img: e.target.value };
                      debounced({
                        ...block,
                        data: {
                          ...(block.data as CardGridData),
                          items,
                        } as CardGridData,
                      });
                    }}
                  />

                  <input
                    className="rounded border p-2 text-black md:col-span-2"
                    value={it.caption ?? ""}
                    placeholder="Optional caption"
                    onChange={(e) => {
                      const items = [...(block.data.items ?? [])];
                      items[i] = { ...items[i], caption: e.target.value };
                      debounced({
                        ...block,
                        data: {
                          ...(block.data as CardGridData),
                          items,
                        } as CardGridData,
                      });
                    }}
                  />
                </div>

                {/* NEW: layout controls */}
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <label className="text-sm text-black flex flex-col gap-1">
                    Align (card)
                    <select
                      className="rounded border p-2 text-black"
                      value={it.align ?? "left"}
                      onChange={(e) => {
                        const items = [...(block.data.items ?? [])];
                        items[i] = {
                          ...items[i],
                          align: e.target.value as "left" | "center" | "right",
                        };
                        debounced({
                          ...block,
                          data: {
                            ...(block.data as CardGridData),
                            items,
                          } as CardGridData,
                        });
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
                      value={it.widthPercent ?? 100}
                      onChange={(e) => {
                        const v = Math.max(
                          10,
                          Math.min(100, Number(e.target.value) || 100)
                        );
                        const items = [...(block.data.items ?? [])];
                        items[i] = { ...items[i], widthPercent: v };
                        debounced({
                          ...block,
                          data: {
                            ...(block.data as CardGridData),
                            items,
                          } as CardGridData,
                        });
                      }}
                    />
                  </label>

                  <label className="text-sm text-black flex flex-col gap-1">
                    Image max width (px)
                    <input
                      type="number"
                      min={0}
                      className="rounded border p-2 text-black"
                      value={it.thumbMaxWidthPx ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value
                          ? Number(e.target.value)
                          : undefined;
                        const v =
                          raw !== undefined && raw < 80 ? undefined : raw; // ⬅ clamp
                        const items = [...(block.data.items ?? [])];
                        items[i] = { ...items[i], thumbMaxWidthPx: v };
                        debounced({
                          ...block,
                          data: {
                            ...(block.data as CardGridData),
                            items,
                          } as CardGridData,
                        });
                      }}
                      placeholder="e.g. 360"
                    />
                  </label>
                </div>

                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <label className="text-sm text-black flex flex-col gap-1">
                    Margin top (px)
                    <input
                      type="number"
                      className="rounded border p-2 text-black"
                      value={it.marginTop ?? 0}
                      onChange={(e) => {
                        const items = [...(block.data.items ?? [])];
                        items[i] = {
                          ...items[i],
                          marginTop: Number(e.target.value),
                        };
                        debounced({
                          ...block,
                          data: {
                            ...(block.data as CardGridData),
                            items,
                          } as CardGridData,
                        });
                      }}
                    />
                  </label>
                  <label className="text-sm text-black flex flex-col gap-1">
                    Margin bottom (px)
                    <input
                      type="number"
                      className="rounded border p-2 text-black"
                      value={it.marginBottom ?? 0}
                      onChange={(e) => {
                        const items = [...(block.data.items ?? [])];
                        items[i] = {
                          ...items[i],
                          marginBottom: Number(e.target.value),
                        };
                        debounced({
                          ...block,
                          data: {
                            ...(block.data as CardGridData),
                            items,
                          } as CardGridData,
                        });
                      }}
                    />
                  </label>
                  <label className="text-sm text-black flex flex-col gap-1">
                    Margin left (px)
                    <input
                      type="number"
                      className="rounded border p-2 text-black"
                      value={it.marginLeft ?? 0}
                      onChange={(e) => {
                        const items = [...(block.data.items ?? [])];
                        items[i] = {
                          ...items[i],
                          marginLeft: Number(e.target.value),
                        };
                        debounced({
                          ...block,
                          data: {
                            ...(block.data as CardGridData),
                            items,
                          } as CardGridData,
                        });
                      }}
                    />
                  </label>
                  <label className="text-sm text-black flex flex-col gap-1">
                    Margin right (px)
                    <input
                      type="number"
                      className="rounded border p-2 text-black"
                      value={it.marginRight ?? 0}
                      onChange={(e) => {
                        const items = [...(block.data.items ?? [])];
                        items[i] = {
                          ...items[i],
                          marginRight: Number(e.target.value),
                        };
                        debounced({
                          ...block,
                          data: {
                            ...(block.data as CardGridData),
                            items,
                          } as CardGridData,
                        });
                      }}
                    />
                  </label>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="rounded border px-2 text-sm"
                    onClick={() => {
                      const items = [...(block.data.items ?? [])];
                      if (i > 0)
                        [items[i - 1], items[i]] = [items[i], items[i - 1]];
                      debounced({
                        ...block,
                        data: {
                          ...(block.data as CardGridData),
                          items,
                        } as CardGridData,
                      });
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="rounded border px-2 text-sm"
                    onClick={() => {
                      const items = [...(block.data.items ?? [])];
                      if (i < items.length - 1)
                        [items[i + 1], items[i]] = [items[i], items[i + 1]];
                      debounced({
                        ...block,
                        data: {
                          ...(block.data as CardGridData),
                          items,
                        } as CardGridData,
                      });
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="rounded border px-2 text-sm text-red-600"
                    onClick={() => {
                      const items = [...(block.data.items ?? [])];
                      items.splice(i, 1);
                      debounced({
                        ...block,
                        data: {
                          ...(block.data as CardGridData),
                          items,
                        } as CardGridData,
                      });
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
              onClick={() => {
                const items = [
                  ...(block.data.items ?? []),
                  {
                    title: "",
                    href: "",
                    img: "",
                    caption: "",
                    widthPercent: 100, // optional default
                  } as CardItem,
                ];
                debounced({
                  ...block,
                  data: {
                    ...(block.data as CardGridData),
                    items,
                  } as CardGridData,
                });
              }}
            >
              + Add card
            </button>

            <div className="text-xs text-neutral-500">
              Cards render in a responsive grid and link to the provided URL.
            </div>
          </div>
        )}
        {/* Animation (applies to any block) */}
        <div className="rounded border p-3">
          <div className="mb-2 text-sm font-medium text-black">Animation</div>
          <div className="grid gap-2 md:grid-cols-3">
            <label className="text-sm text-black flex flex-col gap-1">
              Preset
              <select
                className="rounded border p-2 text-black"
                value={(block.data as WithAnim)._anim?.type ?? ""}
                onChange={(e) => {
                  const type = e.target.value as AnimationSettings["type"] | "";
                  const next: AnimationSettings | undefined = type
                    ? { ...(block.data as WithAnim)._anim, type }
                    : undefined; // clear when blank
                  debounced({
                    ...block,
                    data: {
                      ...(block.data as object),
                      _anim: next,
                    } as Block["data"] & WithAnim,
                  });
                }}
              >
                <option value="">None</option>
                <option value="slideInLeft">Slide in from left</option>
                <option value="slideInRight">Slide in from right</option>
                <option value="slideInTop">Slide in from top</option>
                <option value="slideInBottom">Slide in from bottom</option>
                <option value="fadeIn">Fade in</option>
              </select>
            </label>

            <label className="text-sm text-black flex flex-col gap-1">
              Duration (ms)
              <input
                type="number"
                min={0}
                className="rounded border p-2 text-black"
                value={(block.data as WithAnim)._anim?.durationMs ?? 600}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  const cur = (block.data as WithAnim)._anim ?? {
                    type: "fadeIn" as const,
                  };
                  debounced({
                    ...block,
                    data: {
                      ...(block.data as object),
                      _anim: { ...cur, durationMs: v },
                    } as Block["data"] & WithAnim,
                  });
                }}
              />
            </label>

            <label className="text-sm text-black flex flex-col gap-1">
              Delay (ms)
              <input
                type="number"
                min={0}
                className="rounded border p-2 text-black"
                value={(block.data as WithAnim)._anim?.delayMs ?? 0}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  const cur = (block.data as WithAnim)._anim ?? {
                    type: "fadeIn" as const,
                  };
                  debounced({
                    ...block,
                    data: {
                      ...(block.data as object),
                      _anim: { ...cur, delayMs: v },
                    } as Block["data"] & WithAnim,
                  });
                }}
              />
            </label>
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Choose a preset and (optionally) tweak timing. Leave “Preset” blank
            to disable.
          </div>
        </div>
      </div>
    </div>
  );
}

function AddRow({ onAdd }: { onAdd: (t: BlockType) => void }) {
  const types: BlockType[] = [
    "title",
    "subtitle",
    "paragraph",
    "image",
    "gallery",
    "video_youtube",
    "button",
    "slideshow",
    "date",
    "card_grid",
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {types.map((t) => (
        <button
          type="button"
          key={t}
          className="rounded-2xl border bg-white px-3 py-2 text-sm text-black"
          onClick={() => onAdd(t)}
        >
          + {t}
        </button>
      ))}
    </div>
  );
}

function ColumnsEditor({
  block,
  allBlocks,
  onChange,
  onDelete,
  addChild,
  del,
}: {
  block: Block; // columns
  allBlocks: Block[];
  onChange: (b: Block) => void;
  onDelete: () => void;
  addChild: (parentId: string, slot: "left" | "right", t: BlockType) => void;
  del: (id: string) => void;
}) {
  if (!isColumnsData(block)) return null;

  const cols = block.data.columns;
  const vLeft  = block.data.vAlignLeft  ?? "top";
  const vRight = block.data.vAlignRight ?? "top";

  const left = allBlocks
    .filter((x) => x.parent_id === block.id && x.slot === "left")
    .sort((a, b) => a.position - b.position);
  const right = allBlocks
    .filter((x) => x.parent_id === block.id && x.slot === "right")
    .sort((a, b) => a.position - b.position);

  // helper to map setting -> Tailwind class
  const vClass = (v: "top" | "middle" | "bottom") =>
    v === "middle" ? "justify-center"
    : v === "bottom" ? "justify-end"
    : "justify-start";

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-neutral-500 mb-3">
        <span className="select-none">↕ Drag</span>
        <button type="button" onClick={onDelete} className="text-red-600">
          Delete
        </button>
      </div>

      {/* grid settings */}
      <div className="flex flex-wrap gap-3 items-center mb-3">
        <label className="text-sm flex items-center gap-2 text-black">
          Columns:
          <select
            className="rounded border p-1 text-black"
            value={cols}
            onChange={(e) =>
              onChange({
                ...block,
                data: {
                  ...(block.data as ColumnsData),
                  columns: Number(e.target.value) as 1 | 2,
                },
              })
            }
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>

        {/* NEW: vertical align pickers */}
        <label className="text-sm flex items-center gap-2 text-black">
          Left v-align:
          <select
            className="rounded border p-1 text-black"
            value={vLeft}
            onChange={(e) =>
              onChange({
                ...block,
                data: {
                  ...(block.data as ColumnsData),
                  vAlignLeft: e.target.value as ColumnsData["vAlignLeft"],
                },
              })
            }
          >
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </select>
        </label>

        {cols === 2 && (
          <label className="text-sm flex items-center gap-2 text-black">
            Right v-align:
            <select
              className="rounded border p-1 text-black"
              value={vRight}
              onChange={(e) =>
                onChange({
                  ...block,
                  data: {
                    ...(block.data as ColumnsData),
                    vAlignRight: e.target.value as ColumnsData["vAlignRight"],
                  },
                })
              }
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>
        )}
      </div>

      {/* columns preview */}
      <div className={`grid gap-3 ${cols === 2 ? "md:grid-cols-2" : "grid-cols-1"}`}>
        {/* LEFT column */}
        <div className={`space-y-3 h-full flex flex-col ${vClass(vLeft)}`}>
          <SortableContext
            id={`col-left:${block.id}`}
            items={left.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {left.map((child) => (
              <SortableItem
                key={child.id}
                block={child}
                onChange={onChange}
                onDelete={() => del(child.id)}
              />
            ))}
            <DropZone id={`col-left:${block.id}` as const} />
          </SortableContext>
          <AddRow onAdd={(t) => addChild(block.id, "left", t)} />
        </div>

        {/* RIGHT column */}
        {cols === 2 && (
          <div className={`space-y-3 h-full flex flex-col ${vClass(vRight)}`}>
            <SortableContext
              id={`col-right:${block.id}`}
              items={right.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {right.map((child) => (
                <SortableItem
                  key={child.id}
                  block={child}
                  onChange={onChange}
                  onDelete={() => del(child.id)}
                />
              ))}
              <DropZone id={`col-right:${block.id}` as const} />
            </SortableContext>
            <AddRow onAdd={(t) => addChild(block.id, "right", t)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Main Editor ------------------------------ */

export default function BlockEditor({
  pageId,
  initial,
}: {
  pageId: string;
  initial: Block[]; // must include: id, page_id, block_type, data, position, parent_id, slot
}) {
  const [blocks, setBlocks] = useState(
    [...initial].sort((a, b) => a.position - b.position)
  );
  const sensors = useSensors(useSensor(PointerSensor));

  async function addRoot(type: BlockType) {
    const def = DefaultData[type];
    const roots = blocks.filter((b) => !b.parent_id);
    const last = roots.length ? Math.max(...roots.map((b) => b.position)) : 0;
    const nextPos = last + 1000;

    const { data, error } = await supabase
      .from("content_blocks")
      .insert({
        page_id: pageId,
        block_type: type,
        data: def,
        parent_id: null,
        slot: null,
        position: nextPos,
      })
      .select("*")
      .single();

    if (!error && data) setBlocks((p) => [...p, data as Block]);
  }

  async function addChild(
    parentId: string,
    slot: "left" | "right",
    type: BlockType
  ) {
    const def = DefaultData[type];
    const siblings = blocks.filter(
      (b) => b.parent_id === parentId && b.slot === slot
    );
    const last = siblings.length
      ? Math.max(...siblings.map((b) => b.position))
      : 0;
    const nextPos = last + 1000;

    const { data, error } = await supabase
      .from("content_blocks")
      .insert({
        page_id: pageId,
        block_type: type,
        data: def,
        parent_id: parentId,
        slot,
        position: nextPos,
      })
      .select("*")
      .single();

    if (!error && data) setBlocks((p) => [...p, data as Block]);
  }

  async function updateBlock(nb: Block) {
    setBlocks((prev) => prev.map((x) => (x.id === nb.id ? nb : x)));
    await supabase
      .from("content_blocks")
      .update({ data: nb.data })
      .eq("id", nb.id);
  }

  async function del(id: string) {
    await supabase.from("content_blocks").delete().eq("id", id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeBlock = blocks.find((b) => b.id === activeId)!;

    // dnd-kit gives us the container id via sortable data; fall back to our own mapping
    const activeContainer = (active.data?.current?.sortable?.containerId ??
      containerIdFor(activeBlock)) as ContainerId;

    // If over is an item, its containerId is on data; if it's a DropZone, over.id is the container id
    const overContainer = (over.data?.current?.sortable?.containerId ??
      (overId as ContainerId)) as ContainerId;

    const containers = groupIntoContainers(blocks);
    const srcArr = containers.get(activeContainer)!;
    const dstArr = containers.get(overContainer)!;

    const fromIndex = srcArr.findIndex((b) => b.id === activeId);
    let toIndex = dstArr.findIndex((b) => b.id === overId);
    if (toIndex < 0) toIndex = dstArr.length; // dropped on empty zone

    // same container: reorder only
    if (activeContainer === overContainer) {
      const reordered = arrayMove(srcArr, fromIndex, toIndex);
      const prev = reordered[toIndex - 1]?.position;
      const next = reordered[toIndex + 1]?.position;
      const newPos = between(prev, next);

      setBlocks((prev) =>
        prev.map((b) => (b.id === activeId ? { ...b, position: newPos } : b))
      );
      await supabase
        .from("content_blocks")
        .update({ position: newPos })
        .eq("id", activeId);
      return;
    }

    // cross-container: move + set container + set position
    const before = dstArr[toIndex - 1]?.position;
    const after = dstArr[toIndex]?.position;
    const newPos = between(before, after);
    const { parent_id, slot } = parseContainerId(overContainer);

    setBlocks((prev) =>
      prev.map((b) =>
        b.id === activeId ? { ...b, parent_id, slot, position: newPos } : b
      )
    );

    await supabase
      .from("content_blocks")
      .update({ parent_id, slot, position: newPos })
      .eq("id", activeId);
  }

  return (
    <div>
      {/* root-level add buttons */}
      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            "title",
            "subtitle",
            "paragraph",
            "image",
            "gallery",
            "video_youtube",
            "columns",
            "button",
            "slideshow",
            "date",
            "card_grid",
          ] as BlockType[]
        ).map((t) => (
          <button
            type="button"
            key={t}
            className="rounded-2xl border bg-white px-3 py-2 text-sm text-black"
            onClick={() => (t === "columns" ? addRoot("columns") : addRoot(t))}
          >
            + {t}
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        {/* ROOT container */}
        <SortableContext
          id="root"
          items={blocks.filter((b) => !b.parent_id).map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {blocks
              .filter((b) => !b.parent_id)
              .sort((a, b) => a.position - b.position)
              .map((b) =>
                b.block_type === "columns" ? (
                  <ColumnsEditor
                    key={b.id}
                    block={b}
                    allBlocks={blocks}
                    onChange={updateBlock}
                    onDelete={() => del(b.id)}
                    addChild={addChild}
                    del={del}
                  />
                ) : (
                  <SortableItem
                    key={b.id}
                    block={b}
                    onChange={updateBlock}
                    onDelete={() => del(b.id)}
                  />
                )
              )}
            <DropZone id={"root"} />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
