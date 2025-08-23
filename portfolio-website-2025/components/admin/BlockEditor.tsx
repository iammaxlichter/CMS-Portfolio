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
  ParagraphData,
  ImageData,
  GalleryData,
  VideoData,
  ButtonData,
  SlideshowData,
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
} from "@/lib/blocks/types";

import { DefaultData } from "@/lib/blocks/types";

/* ------------------------------ Helpers ------------------------------ */

type ContainerId = "root" | `col-left:${string}` | `col-right:${string}`;

function containerIdFor(b: Block): ContainerId {
  if (!b.parent_id) return "root";
  return b.slot === "left" ? (`col-left:${b.parent_id}` as const) : (`col-right:${b.parent_id}` as const);
}

function parseContainerId(id: ContainerId): { parent_id: string | null; slot: Slot } {
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
        <span className="cursor-grab select-none" {...attributes} {...listeners}>
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
                  data: { ...block.data, text: e.target.value } as TitleData
                })
              }
              placeholder="Page title"
            />
            <div className="text-xs text-neutral-400">This will render as an H1.</div>
          </>
        )}

        {block.block_type === "subtitle" && isSubtitleData(block) && (
          <input
            className="w-full rounded border p-2 text-lg text-black"
            value={block.data.text}
            onChange={(e) =>
              debounced({
                ...block,
                data: { ...block.data, text: e.target.value } as SubtitleData
              })
            }
            placeholder="Subtitle"
          />
        )}

        {block.block_type === "paragraph" && isParagraphData(block) && (
          <textarea
            className="w-full min-h-28 rounded border p-2 text-black"
            value={block.data.html}
            onChange={(e) =>
              debounced({
                ...block,
                data: { ...block.data, html: e.target.value } as ParagraphData
              })
            }
            placeholder="Write a paragraph…"
          />
        )}

        {block.block_type === "image" && isImageData(block) && (
          <div className="space-y-2">
            <input
              className="w-full rounded border p-2 text-black"
              value={block.data.path}
              onChange={(e) =>
                debounced({
                  ...block,
                  data: { ...block.data, path: e.target.value } as ImageData
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
                  data: { ...block.data, alt: e.target.value } as ImageData
                })
              }
              placeholder="Alt text"
            />
          </div>
        )}

        {block.block_type === "gallery" && isGalleryData(block) && (
          <div className="space-y-2">
            {/* Existing items */}
            {(block.data.paths ?? []).map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 rounded border p-2 text-black"
                  value={p}
                  onChange={(e) => {
                    const paths = [...(block.data.paths ?? [])];
                    paths[i] = e.target.value;
                    debounced({ ...block, data: { ...block.data, paths } as GalleryData });
                  }}
                  placeholder="https://example.com/img.jpg or uploads/hero.png"
                />
                <button
                  type="button"
                  className="rounded border px-2 text-sm"
                  onClick={() => {
                    const paths = [...(block.data.paths ?? [])];
                    paths.splice(i, 1);
                    debounced({ ...block, data: { ...block.data, paths } as GalleryData });
                  }}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}

            <input
              className="w-full rounded border p-2 text-black"
              placeholder="Type or paste URLs; press Enter to add (multi-line paste supported)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = (e.currentTarget.value || "").trim();
                  if (v) {
                    const paths = [...(block.data.paths ?? []), v];
                    debounced({ ...block, data: { ...block.data, paths } as GalleryData });
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
                    debounced({ ...block, data: { ...block.data, paths } as GalleryData });
                  }
                }
              }}
            />

            <div className="text-xs text-neutral-500">
              Tip: Enter, <kbd>Ctrl</kbd>+Enter, or <kbd>Shift</kbd>+Enter will add; multi-line paste adds all.
            </div>
          </div>
        )}


        {block.block_type === "video_youtube" && isVideoData(block) && (
          <input
            className="w-full rounded border p-2 text-black"
            value={block.data.url}
            onChange={(e) =>
              debounced({
                ...block,
                data: { ...block.data, url: e.target.value } as VideoData
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
                  data: { ...block.data, text: e.target.value } as ButtonData,
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
                  data: { ...block.data, href: e.target.value } as ButtonData,
                })
              }
              placeholder="Link (e.g., /projects/mymuse or https://...)"
            />
            <div className="text-xs text-neutral-500">
              Tip: use internal paths (e.g. <code>/about</code>) for same-site links.
            </div>
          </div>
        )}

        {block.block_type === "slideshow" && isSlideshowData(block) && (
          <div className="space-y-2">
            {(block.data.paths ?? []).map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 rounded border p-2 text-black"
                  value={p}
                  onChange={(e) => {
                    const paths = [...(block.data.paths ?? [])];
                    paths[i] = e.target.value;
                    debounced({ ...block, data: { ...block.data, paths } as SlideshowData });
                  }}
                  placeholder="uploads/slide-1.jpg or https://..."
                />
                <button
                  type="button"
                  className="rounded border px-2 text-sm"
                  onClick={() => {
                    const paths = [...(block.data.paths ?? [])];
                    paths.splice(i, 1);
                    debounced({ ...block, data: { ...block.data, paths } as SlideshowData });
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
                    debounced({ ...block, data: { ...block.data, paths } as SlideshowData });
                    e.currentTarget.value = "";
                  }
                }
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (/\r?\n/.test(text)) {
                  e.preventDefault();
                  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
                  if (lines.length) {
                    const paths = [...(block.data.paths ?? []), ...lines];
                    debounced({ ...block, data: { ...block.data, paths } as SlideshowData });
                  }
                }
              }}
            />

            <div className="text-xs text-neutral-500">This renders as a sliding carousel.</div>
          </div>
        )}

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
    "slideshow"
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
  const left = allBlocks
    .filter((x) => x.parent_id === block.id && x.slot === "left")
    .sort((a, b) => a.position - b.position);
  const right = allBlocks
    .filter((x) => x.parent_id === block.id && x.slot === "right")
    .sort((a, b) => a.position - b.position);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-neutral-500 mb-3">
        <span className="select-none">↕ Drag</span>
        <button type="button" onClick={onDelete} className="text-red-600">
          Delete
        </button>
      </div>

      <label className="text-sm flex items-center gap-2 text-black mb-3">
        Columns:
        <select
          className="rounded border p-1 text-black"
          value={cols}
          onChange={(e) =>
            onChange({
              ...block,
              data: { columns: Number(e.target.value) as 1 | 2 } as ColumnsData
            })
          }
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
      </label>

      <div className={`grid gap-3 ${cols === 2 ? "md:grid-cols-2" : "grid-cols-1"}`}>
        {/* LEFT */}
        <div className="space-y-3">
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

        {/* RIGHT */}
        {cols === 2 && (
          <div className="space-y-3">
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
    const last = siblings.length ? Math.max(...siblings.map((b) => b.position)) : 0;
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
    await supabase.from("content_blocks").update({ data: nb.data }).eq("id", nb.id);
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
          ] as BlockType[]
        ).map((t) => (
          <button
            type="button"
            key={t}
            className="rounded-2xl border bg-white px-3 py-2 text-sm text-black"
            onClick={() =>
              t === "columns" ? addRoot("columns") : addRoot(t)
            }
          >
            + {t}
          </button>
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
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