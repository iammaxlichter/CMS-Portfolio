// components/admin/achievements/AchievementsManager.tsx
"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type Row = {
    id: string;
    text: string;
    position: number;
    published: boolean;
};

type Props = {
    initial: Row[];
    saveAllAction: (formData: FormData) => Promise<void>;
    deleteAction?: (formData: FormData) => Promise<void>;
};

export default function AchievementsManager({
    initial,
    saveAllAction,
    deleteAction,
}: Props) {
    const [items, setItems] = useState<Row[]>(
        [...initial].sort((a, b) => a.position - b.position)
    );
    const [dirty, setDirty] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Hydration guard (dnd-kit can be finicky SSR -> CSR)
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    );
    const ids = useMemo(() => items.map((i) => i.id), [items]);

    function onDragEnd(e: DragEndEvent) {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((x) => x.id === active.id);
        const newIndex = items.findIndex((x) => x.id === over.id);
        const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({
            ...x,
            position: i + 1,
        }));
        setItems(next);
        setDirty(true);
    }

    function onRowChange(id: string, patch: Partial<Pick<Row, "text" | "published">>) {
        setItems((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
        );
        if (!dirty) setDirty(true);
    }

    const handleSaveAll = () => {
        const form = document.getElementById('save-all-form') as HTMLFormElement;
        if (form) {
            startTransition(async () => {
                const formData = new FormData(form);
                await saveAllAction(formData);
                setDirty(false);
            });
        }
    };

    return (
        <>
            {/* BIG SAVE-ALL FORM - prevent auto-submission */}
            <form
                id="save-all-form"
                onSubmit={(e) => e.preventDefault()}
                className="space-y-3"
            >
                {/* ids in current visual order (top→bottom) */}
                {items.map((r) => (
                    <input key={`ids-${r.id}`} type="hidden" name="ids" value={r.id} />
                ))}

                {/* Visible list - use same component, conditionally wrap in DnD */}
                {isMounted ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={onDragEnd}
                    >
                        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                            <ul className=" border divide-y bg-white">
                                {items.map((row) => (
                                    <SortableRow
                                        key={row.id}
                                        row={row}
                                        onRowChange={onRowChange}
                                        deleteFormId={deleteAction ? `delete-${row.id}` : undefined}
                                        enableDrag={true}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <ul className="rounded-md  divide-y bg-white">
                        {items.map((row) => (
                            <SortableRow
                                key={row.id}
                                row={row}
                                onRowChange={onRowChange}
                                deleteFormId={deleteAction ? `delete-${row.id}` : undefined}
                                enableDrag={false}
                            />
                        ))}
                    </ul>
                )}

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveAll}
                        disabled={!dirty || isPending}
                        className="rounded bg-black text-white px-3 py-2 text-sm disabled:opacity-40"
                    >
                        {isPending ? "Saving…" : "Save all changes"}
                    </button>
                    {dirty && !isPending && (
                        <span className="text-xs text-amber-700">Unsaved changes</span>
                    )}
                </div>
            </form>

            {/* SEPARATE, HIDDEN DELETE FORMS (one per row) */}
            {deleteAction &&
                items.map((r) => (
                    <form
                        key={`del-form-${r.id}`}
                        id={`delete-${r.id}`}
                        action={deleteAction}
                        className="hidden"
                    >
                        <input type="hidden" name="id" value={r.id} />
                    </form>
                ))}
        </>
    );
}

function SortableRow({
    row,
    onRowChange,
    deleteFormId,
    enableDrag = true,
}: {
    row: Row;
    onRowChange: (id: string, patch: Partial<Pick<Row, "text" | "published">>) => void;
    deleteFormId?: string;
    enableDrag?: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: row.id, disabled: !enableDrag });

    const style = enableDrag
        ? {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.6 : 1,
            zIndex: isDragging ? 10 : "auto",
        }
        : {};

    const handleDeleteClick = () => {
        const preview = row.text.length > 60 ? row.text.slice(0, 57) + "…" : row.text;
        const ok = window.confirm(`Delete this achievement?\n\n"${preview}"`);
        if (!ok) return;

        if (deleteFormId) {
            const form = document.getElementById(deleteFormId) as HTMLFormElement | null;
            if (form) {
                if (typeof form.requestSubmit === "function") form.requestSubmit();
                else form.submit();
            }
        }
    };

    return (
        <li ref={setNodeRef} style={style} className="p-3 pt-5 pb-5 bg-white">
            <div className="flex gap-3 items-start">
                <span
                    className={`select-none text-neutral-500 pt-2 ${enableDrag ? "cursor-grab hover:text-neutral-800" : ""
                        }`}
                    title={enableDrag ? "Drag to reorder" : ""}
                    {...(enableDrag ? attributes : {})}
                    {...(enableDrag ? listeners : {})}
                >
                    ⋮⋮
                </span>

                <div className="flex-1 flex items-center gap-3">
                    <input type="hidden" name={`position-${row.id}`} value={row.position} />

                    <textarea
                        name={`text-${row.id}`}
                        value={row.text}
                        onChange={(e) => onRowChange(row.id, { text: e.target.value })}
                        rows={2}
                        className="w-full rounded border p-2 text-sm resize-y min-h-[56px]"
                        onPointerDown={(e) => e.stopPropagation()}
                    />

                    <label className="text-xs flex items-center gap-1 text-neutral-700">
                        <input
                            type="checkbox"
                            name={`published-${row.id}`}
                            checked={row.published}
                            onChange={(e) => onRowChange(row.id, { published: e.target.checked })}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                        Published
                    </label>
                </div>

                {deleteFormId && (
                    <button
                        type="button"                          
                        onClick={handleDeleteClick}
                        onPointerDown={(e) => e.stopPropagation()} 
                        className="self-center rounded border px-2.5 py-1.5 text-xs text-red-700"
                        title="Delete"
                        aria-label={`Delete achievement ${row.text.slice(0, 30)}…`}
                    >
                        Delete
                    </button>
                )}
            </div>
        </li>
    );
}