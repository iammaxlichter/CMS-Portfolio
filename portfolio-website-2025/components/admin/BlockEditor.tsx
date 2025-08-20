"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/lib/supabase/client";
// CHANGED: use shared types module
import type { Block, BlockType } from "@/lib/blocks/types";
import { DefaultData } from "@/lib/blocks/types";

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
    useSortable({
      id: block.id,
    });
  const style = { transform: CSS.Transform.toString(transform), transition };

  // optional debounce for smoother typing saves
  const debounced = useDebounce(onChange, 400); // CHANGED: debounce saves

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span className="cursor-grab" {...attributes} {...listeners}>
          ↕ Drag
        </span>
        <button onClick={onDelete} className="text-red-600">
          Delete
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {block.block_type === "title" && (
          <>
            <input
              className="w-full rounded border p-2 text-xl font-bold text-black"
              value={block.data.text}
              onChange={
                (e) =>
                  debounced({
                    ...block,
                    data: { ...block.data, text: e.target.value },
                  }) // CHANGED
              }
              placeholder="Page title"
            />
            <div className="text-xs text-neutral-400">
              This will render as an H1.
            </div>
          </>
        )}

        {block.block_type === "subtitle" && (
          <input
            className="w-full rounded border p-2 text-lg text-black"
            value={block.data.text}
            onChange={
              (e) =>
                debounced({
                  ...block,
                  data: { ...block.data, text: e.target.value },
                }) // CHANGED
            }
            placeholder="Subtitle"
          />
        )}

        {block.block_type === "paragraph" && (
          <textarea
            className="w-full min-h-28 rounded border p-2 text-black"
            value={block.data.html}
            onChange={
              (e) =>
                debounced({
                  ...block,
                  data: { ...block.data, html: e.target.value },
                }) // CHANGED
            }
            placeholder="Write a paragraph…"
          />
        )}

        {block.block_type === "image" && (
          <div className="space-y-2">
            <input
              className="w-full rounded border p-2 text-black"
              value={block.data.path}
              onChange={
                (e) =>
                  debounced({
                    ...block,
                    data: { ...block.data, path: e.target.value },
                  }) // CHANGED
              }
              placeholder="Storage path (e.g. uploads/hero.png)"
            />
            <input
              className="w-full rounded border p-2 text-black"
              value={block.data.alt}
              onChange={
                (e) =>
                  debounced({
                    ...block,
                    data: { ...block.data, alt: e.target.value },
                  }) // CHANGED
              }
              placeholder="Alt text"
            />
          </div>
        )}

        {block.block_type === "gallery" && (
          <div className="space-y-2">
            <textarea
              className="w-full rounded border p-2 text-black"
              value={block.data.paths.join("\n")}
              onChange={
                (e) =>
                  debounced({
                    ...block,
                    data: {
                      ...block.data,
                      paths: e.target.value.split("\n").filter(Boolean),
                    },
                  }) // CHANGED
              }
              placeholder={
                "One image path per line\nuploads/a.png\nuploads/b.png"
              }
            />
            <div className="text-xs text-neutral-500">
              Displays in a responsive row.
            </div>
          </div>
        )}

        {block.block_type === "video_youtube" && (
          <input
            className="w-full rounded border p-2 text-black"
            value={block.data.url}
            onChange={
              (e) =>
                debounced({
                  ...block,
                  data: { ...block.data, url: e.target.value },
                }) // CHANGED
            }
            placeholder="YouTube URL"
          />
        )}

        {block.block_type === "columns" && (
          <div className="space-y-3">
            <label className="text-sm flex items-center gap-2 text-black">
              Columns:
              <select
                className="rounded border p-1 text-black"
                value={block.data.columns}
                onChange={
                  (e) =>
                    debounced({
                      ...block,
                      data: {
                        ...block.data,
                        columns: Number(e.target.value) as 1 | 2,
                      },
                    }) // CHANGED
                }
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </label>
            <div
              className={`grid gap-3 grid-cols-1 ${
                block.data.columns === 2 ? "md:grid-cols-2" : ""
              }`}
            >
              <textarea
                className="min-h-24 rounded border p-2 text-black"
                value={(block.data.left ?? []).join("\n")}
                onChange={
                  (e) =>
                    debounced({
                      ...block,
                      data: { ...block.data, left: e.target.value.split("\n") },
                    }) // CHANGED
                }
                placeholder={"Left column notes (temporary text-based columns)"}
              />
              {block.data.columns === 2 && (
                <textarea
                  className="min-h-24 rounded border p-2 text-black"
                  value={(block.data.right ?? []).join("\n")}
                  onChange={
                    (e) =>
                      debounced({
                        ...block,
                        data: {
                          ...block.data,
                          right: e.target.value.split("\n"),
                        },
                      }) // CHANGED
                  }
                  placeholder={"Right column notes"}
                />
              )}
            </div>
            <div className="text-xs text-neutral-500">
              On mobile, column 1 stacks above column 2 automatically.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlockEditor({
  pageId,
  initial,
}: {
  pageId: string;
  initial: Block[];
}) {
  // CHANGED: sort by position, not sort_index
  const [blocks, setBlocks] = useState(
    [...initial].sort((a, b) => a.position - b.position)
  );
  const sensors = useSensors(useSensor(PointerSensor));

  // CHANGED: fractional position helper
  function between(prev?: number, next?: number) {
    if (prev == null && next == null) return 1000;
    if (prev == null) return next! - 1000;
    if (next == null) return prev + 1000;
    return (prev + next) / 2;
  }

  // CHANGED: onDragEnd updates only the moved row
  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    const reordered = arrayMove(blocks, oldIndex, newIndex);
    const prev = reordered[newIndex - 1]?.position;
    const next = reordered[newIndex + 1]?.position;
    const newPos = between(prev, next);
    const movedId = String(active.id);

    // optimistic UI
    setBlocks(
      reordered.map((b) => (b.id === movedId ? { ...b, position: newPos } : b))
    );

    // 👇 actually persist and check for errors
    const { error } = await supabase
      .from("content_blocks")
      .update({ position: newPos })
      .eq("id", movedId);

    if (error) {
      console.error("Failed to update position:", error);
      // revert UI if you want:
      setBlocks(blocks);
    }
  }

  // CHANGED: add with spaced position, no sort_index
  async function add(type: BlockType) {
    const def = DefaultData[type];
    const lastPos = Math.max(
      0,
      ...blocks.map((b) => b.position ?? (b.sort_index ?? 0) * 1000)
    );
    const nextPos = lastPos + 1000;

    const { data, error } = await supabase
      .from("content_blocks")
      .insert({
        page_id: pageId,
        block_type: type,
        data: def,
        position: nextPos,
      })
      .select("*")
      .single();

    if (!error && data) {
      setBlocks((prev) =>
        [...prev, data as Block].sort((a, b) => a.position - b.position)
      );
    }
  }

  // same: update only the changed block’s data
  async function updateBlock(nb: Block) {
    setBlocks((prev) => prev.map((x) => (x.id === nb.id ? nb : x)));
    await supabase
      .from("content_blocks")
      .update({ data: nb.data })
      .eq("id", nb.id);
  }

  // CHANGED: delete without renumbering
  async function del(id: string) {
    await supabase.from("content_blocks").delete().eq("id", id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div>
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
          ] as BlockType[]
        ).map((t) => (
          <button
            key={t}
            className="rounded-2xl border bg-white px-3 py-2 text-sm text-black"
            onClick={() => void add(t)}
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
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {blocks.map((b) => (
              <SortableItem
                key={b.id}
                block={b}
                onChange={updateBlock}
                onDelete={() => void del(b.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

/** Tiny debounce helper */
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
