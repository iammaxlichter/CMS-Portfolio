// components/admin/editor/NavOrderBoard.tsx
"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
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
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PageRow = {
  id: string;
  title: string;
  kind: "project" | "experience" | "standalone" | "additional";
  published: boolean | null;
  nav_order: number | null;
};

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function SortableItem({ id, title }: { id: string; title: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded border px-3 py-2 bg-white"
    >
      <span className="truncate">{title}</span>
      <span
        className="cursor-grab select-none text-neutral-500"
        {...attributes}
        {...listeners}
        title="Drag"
      >
        ↕
      </span>
    </li>
  );
}

function StaticItem({ title }: { title: string }) {
  return (
    <li className="flex items-center justify-between rounded border px-3 py-2 bg-white">
      <span className="truncate">{title}</span>
      <span className="select-none text-neutral-400" title="Drag">
        ↕
      </span>
    </li>
  );
}

export default function NavOrderBoard({
  initialPages,
  action,
}: {
  initialPages: PageRow[];
  action: (formData: FormData) => Promise<void>;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const initialProjects = useMemo(
    () =>
      initialPages
        .filter((p) => p.kind === "project" && p.published)
        .sort(
          (a, b) =>
            (a.nav_order ?? 1e9) - (b.nav_order ?? 1e9) ||
            a.title.localeCompare(b.title)
        )
        .map((p) => p.id),
    [initialPages]
  );

  const initialExperience = useMemo(
    () =>
      initialPages
        .filter((p) => p.kind === "experience" && p.published)
        .sort(
          (a, b) =>
            (a.nav_order ?? 1e9) - (b.nav_order ?? 1e9) ||
            a.title.localeCompare(b.title)
        )
        .map((p) => p.id),
    [initialPages]
  );

  const initialStandalones = useMemo(
    () =>
      initialPages
        .filter((p) => p.kind === "standalone" && p.published)
        .sort(
          (a, b) =>
            (a.nav_order ?? 1e9) - (b.nav_order ?? 1e9) ||
            a.title.localeCompare(b.title)
        )
        .map((p) => p.id),
    [initialPages]
  );

  // Current lists
  const [projects, setProjects] = useState<string[]>(initialProjects);
  const [experience, setExperience] = useState<string[]>(initialExperience);
  const [standalones, setStandalones] = useState<string[]>(initialStandalones);

  // Baselines (for "dirty" detection); reset after successful save
  const [baseProjects, setBaseProjects] = useState<string[]>(initialProjects);
  const [baseExperience, setBaseExperience] =
    useState<string[]>(initialExperience);
  const [baseStandalones, setBaseStandalones] =
    useState<string[]>(initialStandalones);

  // Sync if initialPages change
  useEffect(() => {
    setProjects(initialProjects);
    setExperience(initialExperience);
    setStandalones(initialStandalones);
    setBaseProjects(initialProjects);
    setBaseExperience(initialExperience);
    setBaseStandalones(initialStandalones);
  }, [initialProjects, initialExperience, initialStandalones]);

  const byId = useMemo(() => {
    const m = new Map(initialPages.map((p) => [p.id, p]));
    return (id: string) => m.get(id)!;
  }, [initialPages]);

  const isDirty = useMemo(() => {
    return (
      !arraysEqual(projects, baseProjects) ||
      !arraysEqual(experience, baseExperience) ||
      !arraysEqual(standalones, baseStandalones)
    );
  }, [
    projects,
    experience,
    standalones,
    baseProjects,
    baseExperience,
    baseStandalones,
  ]);

  function onDragEnd(kind: "project" | "experience" | "standalone") {
    return (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const a = String(active.id);
      const o = String(over.id);
      if (kind === "project") {
        const oldIndex = projects.indexOf(a);
        const newIndex = projects.indexOf(o);
        setProjects((p) => arrayMove(p, oldIndex, newIndex));
      } else if (kind === "experience") {
        const oldIndex = experience.indexOf(a);
        const newIndex = experience.indexOf(o);
        setExperience((p) => arrayMove(p, oldIndex, newIndex));
      } else {
        const oldIndex = standalones.indexOf(a);
        const newIndex = standalones.indexOf(o);
        setStandalones((p) => arrayMove(p, oldIndex, newIndex));
      }
    };
  }

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  // Auto-hide status after a short delay
  useEffect(() => {
    if (status === "saved" || status === "error") {
      const t = setTimeout(() => setStatus("idle"), 2500);
      return () => clearTimeout(t);
    }
  }, [status]);

  return (
    <section className="space-y-4">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Projects */}
        <div>
          <h3 className="mb-2 font-semibold">Projects</h3>

          {isMounted ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd("project")}
            >
              <SortableContext
                items={projects}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {projects.length > 0 ? (
                    projects.map((id) => (
                      <SortableItem key={id} id={id} title={byId(id).title} />
                    ))
                  ) : (
                    <li className="text-sm text-neutral-500 italic">
                      No published projects
                    </li>
                  )}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <ul className="space-y-2">
              {projects.length > 0 ? (
                projects.map((id) => (
                  <StaticItem key={id} title={byId(id).title} />
                ))
              ) : (
                <li className="text-sm text-neutral-500 italic">
                  No published projects
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Experience */}
        <div>
          <h3 className="mb-2 font-semibold">Experience</h3>

          {isMounted ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd("experience")}
            >
              <SortableContext
                items={experience}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {experience.length > 0 ? (
                    experience.map((id) => (
                      <SortableItem key={id} id={id} title={byId(id).title} />
                    ))
                  ) : (
                    <li className="text-sm text-neutral-500 italic">
                      No published experience
                    </li>
                  )}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <ul className="space-y-2">
              {experience.length > 0 ? (
                experience.map((id) => (
                  <StaticItem key={id} title={byId(id).title} />
                ))
              ) : (
                <li className="text-sm text-neutral-500 italic">
                  No published experience
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Standalones */}
        <div>
          <h3 className="mb-2 font-semibold">Standalone Pages</h3>

          {isMounted ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd("standalone")}
            >
              <SortableContext
                items={standalones}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {standalones.length > 0 ? (
                    standalones.map((id) => (
                      <SortableItem key={id} id={id} title={byId(id).title} />
                    ))
                  ) : (
                    <li className="text-sm text-neutral-500 italic">
                      No published standalone pages
                    </li>
                  )}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <ul className="space-y-2">
              {standalones.length > 0 ? (
                standalones.map((id) => (
                  <StaticItem key={id} title={byId(id).title} />
                ))
              ) : (
                <li className="text-sm text-neutral-500 italic">
                  No published standalone pages
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* SAVE BAR */}
      <form
        action={(fd) => {
          setStatus("idle");
          startTransition(async () => {
            try {
              await action(fd);
              setBaseProjects(projects);
              setBaseExperience(experience);
              setBaseStandalones(standalones);
              setStatus("saved");
            } catch {
              setStatus("error");
            }
          });
        }}
        className="flex items-center gap-3"
      >
        <input
          type="hidden"
          name="projects"
          value={JSON.stringify(projects)}
          readOnly
        />
        <input
          type="hidden"
          name="experience"
          value={JSON.stringify(experience)}
          readOnly
        />
        <input
          type="hidden"
          name="standalones"
          value={JSON.stringify(standalones)}
          readOnly
        />

        <button
          type="submit"
          disabled={!isDirty || isPending}
          className={`rounded px-3 py-2 text-sm text-white transition
            ${isDirty && !isPending ? "bg-black hover:bg-neutral-900" : "bg-black/60 cursor-not-allowed"}
          `}
          aria-disabled={!isDirty || isPending}
        >
          {isPending ? "Saving…" : isDirty ? "Save navbar order" : "No changes"}
        </button>

        <span
          aria-live="polite"
          className={`text-xs ${status === "saved"
            ? "text-green-700"
            : status === "error"
              ? "text-red-700"
              : "text-neutral-500"
            }`}
        >
          {status === "saved" && "Changes saved!"}
          {status === "error" && "Save failed. Try again."}
          {status === "idle" && isDirty && "Unsaved changes"}
        </span>
      </form>
    </section>
  );
}
