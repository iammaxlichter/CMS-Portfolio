'use client';

import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/lib/supabase/client';
import type { Block, BlockType } from '@/components/admin/BlockTypes';
import { DefaultData } from '@/components/admin/BlockTypes';

function SortableItem({
  block,
  onChange,
  onDelete,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span className="cursor-grab" {...attributes} {...listeners}>
          ↕ Drag
        </span>
        <button onClick={onDelete} className="text-red-600">
          Delete
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {block.block_type === 'title' && (
          <>
            <input
              className="w-full rounded border p-2 text-xl font-bold"
              value={block.data.text}
              onChange={(e) =>
                onChange({ ...block, data: { ...block.data, text: e.target.value } })
              }
              placeholder="Page title"
            />
            <div className="text-xs text-neutral-400">This will render as an H1.</div>
          </>
        )}

        {block.block_type === 'subtitle' && (
          <input
            className="w-full rounded border p-2 text-lg"
            value={block.data.text}
            onChange={(e) =>
              onChange({ ...block, data: { ...block.data, text: e.target.value } })
            }
            placeholder="Subtitle"
          />
        )}

        {block.block_type === 'paragraph' && (
          <textarea
            className="w-full min-h-28 rounded border p-2"
            value={block.data.html}
            onChange={(e) =>
              onChange({ ...block, data: { ...block.data, html: e.target.value } })
            }
            placeholder="Write a paragraph…"
          />
        )}

        {block.block_type === 'image' && (
          <div className="space-y-2">
            <input
              className="w-full rounded border p-2"
              value={block.data.path}
              onChange={(e) =>
                onChange({ ...block, data: { ...block.data, path: e.target.value } })
              }
              placeholder="Storage path (e.g. uploads/hero.png)"
            />
            <input
              className="w-full rounded border p-2"
              value={block.data.alt}
              onChange={(e) =>
                onChange({ ...block, data: { ...block.data, alt: e.target.value } })
              }
              placeholder="Alt text"
            />
          </div>
        )}

        {block.block_type === 'gallery' && (
          <div className="space-y-2">
            <textarea
              className="w-full rounded border p-2"
              value={block.data.paths.join('\n')}
              onChange={(e) =>
                onChange({
                  ...block,
                  data: { ...block.data, paths: e.target.value.split('\n').filter(Boolean) },
                })
              }
              placeholder={'One image path per line\nuploads/a.png\nuploads/b.png'}
            />
            <div className="text-xs text-neutral-500">Displays in a responsive row.</div>
          </div>
        )}

        {block.block_type === 'video_youtube' && (
          <input
            className="w-full rounded border p-2"
            value={block.data.url}
            onChange={(e) =>
              onChange({ ...block, data: { ...block.data, url: e.target.value } })
            }
            placeholder="YouTube URL"
          />
        )}

        {block.block_type === 'columns' && (
          <div className="space-y-3">
            <label className="text-sm flex items-center gap-2">
              Columns:
              <select
                className="rounded border p-1"
                value={block.data.columns}
                onChange={(e) =>
                  onChange({
                    ...block,
                    data: { ...block.data, columns: Number(e.target.value) as 1 | 2 },
                  })
                }
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </label>
            <div
              className={`grid gap-3 grid-cols-1 ${
                block.data.columns === 2 ? 'md:grid-cols-2' : ''
              }`}
            >
              <textarea
                className="min-h-24 rounded border p-2"
                value={(block.data.left ?? []).join('\n')}
                onChange={(e) =>
                  onChange({
                    ...block,
                    data: { ...block.data, left: e.target.value.split('\n') },
                  })
                }
                placeholder={'Left column notes (temporary text-based columns)'}
              />
              {block.data.columns === 2 && (
                <textarea
                  className="min-h-24 rounded border p-2"
                  value={(block.data.right ?? []).join('\n')}
                  onChange={(e) =>
                    onChange({
                      ...block,
                      data: { ...block.data, right: e.target.value.split('\n') },
                    })
                  }
                  placeholder={'Right column notes'}
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
  const [blocks, setBlocks] = useState(
    [...initial].sort((a, b) => a.sort_index - b.sort_index)
  );
  const sensors = useSensors(useSensor(PointerSensor));

  async function persist(newBlocks: Block[]) {
    setBlocks(newBlocks);
    await Promise.all(
      newBlocks.map((b, i) =>
        supabase
          .from('content_blocks')
          .update({ data: b.data, sort_index: i })
          .eq('id', b.id)
      )
    );
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const ordered = arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({
      ...b,
      sort_index: i,
    }));
    void persist(ordered);
  }

  async function add(type: BlockType) {
    const def = DefaultData[type];
    const { data, error } = await supabase
      .from('content_blocks')
      .insert({
        page_id: pageId,
        block_type: type,
        data: def,
        sort_index: blocks.length,
      })
      .select('*')
      .single();

    if (!error && data) setBlocks((prev) => [...prev, data as Block]);
  }

  async function updateBlock(nb: Block) {
    setBlocks((prev) => prev.map((x) => (x.id === nb.id ? nb : x)));
    await supabase.from('content_blocks').update({ data: nb.data }).eq('id', nb.id);
  }

  async function del(id: string) {
    await supabase.from('content_blocks').delete().eq('id', id);
    const arr = blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, sort_index: i }));
    void persist(arr);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(['title', 'subtitle', 'paragraph', 'image', 'gallery', 'video_youtube', 'columns'] as BlockType[]).map(
          (t) => (
            <button
              key={t}
              className="rounded-2xl border bg-white px-3 py-2 text-sm"
              onClick={() => void add(t)}
            >
              + {t}
            </button>
          )
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
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
