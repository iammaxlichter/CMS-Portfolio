"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
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

function Item({ id, title }: { id: string; title: string }) {
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

export default function NavOrderBoard({
  initialPages,
  action,
}: {
  initialPages: PageRow[];
  action: (formData: FormData) => void; // server action
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  // Prepare lists (published only, since only those appear in nav)
  const [projects, setProjects] = useState<string[]>(
    useMemo(
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
    )
  );
  
  const [experience, setExperience] = useState<string[]>(
    useMemo(
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
    )
  );

  const [standalones, setStandalones] = useState<string[]>(
    useMemo(
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
    )
  );

  const byId = useMemo(() => {
    const m = new Map(initialPages.map((p) => [p.id, p]));
    return (id: string) => m.get(id)!;
  }, [initialPages]);

  function onDragEnd(kind: "project" | "experience" | "standalone") {
    return (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      
      if (kind === "project") {
        const oldIndex = projects.indexOf(String(active.id));
        const newIndex = projects.indexOf(String(over.id));
        setProjects((p) => arrayMove(p, oldIndex, newIndex));
      } else if (kind === "experience") {
        const oldIndex = experience.indexOf(String(active.id));
        const newIndex = experience.indexOf(String(over.id));
        setExperience((p) => arrayMove(p, oldIndex, newIndex));
      } else if (kind === "standalone") {
        const oldIndex = standalones.indexOf(String(active.id));
        const newIndex = standalones.indexOf(String(over.id));
        setStandalones((p) => arrayMove(p, oldIndex, newIndex));
      }
    };
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Projects */}
        <div>
          <h3 className="mb-2 font-semibold">Projects (navbar order)</h3>
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
                    <Item key={id} id={id} title={byId(id).title} />
                  ))
                ) : (
                  <li className="text-sm text-neutral-500 italic">No published projects</li>
                )}
              </ul>
            </SortableContext>
          </DndContext>
        </div>

        {/* Experience */}
        <div>
          <h3 className="mb-2 font-semibold">Experience (navbar order)</h3>
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
                    <Item key={id} id={id} title={byId(id).title} />
                  ))
                ) : (
                  <li className="text-sm text-neutral-500 italic">No published experience</li>
                )}
              </ul>
            </SortableContext>
          </DndContext>
        </div>

        {/* Standalones */}
        <div>
          <h3 className="mb-2 font-semibold">Standalone Pages (navbar order)</h3>
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
                    <Item key={id} id={id} title={byId(id).title} />
                  ))
                ) : (
                  <li className="text-sm text-neutral-500 italic">No published standalone pages</li>
                )}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <form action={action} className="flex items-center gap-3">
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
        <button className="rounded bg-black px-3 py-2 text-white">
          Save navbar order
        </button>
      </form>
    </section>
  );
}