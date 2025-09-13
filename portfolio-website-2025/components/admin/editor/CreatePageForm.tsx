"use client";

import { useState, useTransition, useEffect } from "react";

type Kind = "project" | "experience" | "additional" | "standalone";

export default function CreatePageForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState<Kind>("standalone");

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  // basic validity: must have title + slug
  const isValid = title.trim().length > 0 && slug.trim().length > 0;

  // auto-hide status after a moment if we ever show it (useful in dev/no-redirect flows)
  useEffect(() => {
    if (status === "saved" || status === "error") {
      const t = setTimeout(() => setStatus("idle"), 2000);
      return () => clearTimeout(t);
    }
  }, [status]);

  return (
    <form
      action={(fd) => {
        setStatus("idle");
        // keep inputs controlled so the form posts what the user sees
        fd.set("title", title);
        fd.set("slug", slug);
        fd.set("kind", kind);

        startTransition(async () => {
          try {
            await action(fd); // server action will redirect back to /admin
            setStatus("saved");
            // Optional: reset fields in local/dev where redirect may not happen immediately
            setTitle("");
            setSlug("");
            setKind("standalone");
          } catch {
            setStatus("error");
          }
        });
      }}
      className="flex flex-wrap items-center gap-3"
    >
      <input
        name="title"
        placeholder="Page title"
        className="rounded border p-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        name="slug"
        placeholder="slug (e.g. my-project)"
        className="rounded border p-2"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
      />

      <label className="text-sm flex items-center gap-2">
        <input
          type="radio"
          name="kind"
          value="project"
          checked={kind === "project"}
          onChange={() => setKind("project")}
        />
        Project
      </label>
      <label className="text-sm flex items-center gap-2">
        <input
          type="radio"
          name="kind"
          value="experience"
          checked={kind === "experience"}
          onChange={() => setKind("experience")}
      />
        Experience
      </label>
      <label className="text-sm flex items-center gap-2">
        <input
          type="radio"
          name="kind"
          value="additional"
          checked={kind === "additional"}
          onChange={() => setKind("additional")}
        />
        Additional
      </label>
      <label className="text-sm flex items-center gap-2">
        <input
          type="radio"
          name="kind"
          value="standalone"
          checked={kind === "standalone"}
          onChange={() => setKind("standalone")}
        />
        Standalone
      </label>

      <button
        type="submit"
        disabled={!isValid || isPending}
        className={`rounded px-3 py-2 text-white transition
          ${isValid && !isPending ? "bg-black hover:bg-neutral-900" : "bg-black/60 cursor-not-allowed"}
        `}
        aria-disabled={!isValid || isPending}
      >
        {isPending ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
