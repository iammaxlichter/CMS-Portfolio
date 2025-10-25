"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Kind = "project" | "experience" | "additional" | "standalone";

export default function CheatSheetDropdown({
  pageTitle,
  pageKind,
  top = 100,
  storageKey = "cheatsheet_pos",
  supabaseUrl,
  vercelUrl,
}: {
  pageTitle?: string | null;
  pageKind?: Kind | null;
  top?: number;
  storageKey?: string;
  supabaseUrl?: string; // e.g. "https://mjlcamulmtvseegaihce.supabase.co"
  vercelUrl?: string;   // e.g. "https://vercel.com/<org>/<project>"
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // --- GLOBAL CHEAT SHEET CONTENT ---
  const sections = useMemo(() => {
    const supa = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const verc = vercelUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
    return [
      {
        title: "Animations",
        items: [
          "Title: slide-in from left.",
          "Subtitle + Date: fade-in, 600ms delay after title.",
        ],
      },
      {
        title: "Typography",
        items: [
          "Standard base font-size: 15px.",
        ],
      },
      {
        title: "Spacing",
        items: [
          "Space from subtitle/date → main content: 80px.",
          "Space from last content block → bottom: 80px.",
        ],
      },
      {
        title: "Links",
        items: [
          supa ? { label: "Supabase Dashboard", href: supa } : "Supabase link: (set in props)",
          verc ? { label: "Vercel Project", href: verc } : "Vercel link: (set in props)",
        ],
      },
      {
        title: "Media Conventions",
        items: [
          "Images go under: images/projects|experience/<slug>/<slug>-#.png",
          "Example: images/projects/sportscanner/sportscanner-1.png",
        ],
      },
    ];
  }, [supabaseUrl, vercelUrl]);

  // restore saved position
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (raw) {
      try {
        const { x, y } = JSON.parse(raw);
        if (typeof x === "number" && typeof y === "number") setPos({ x, y });
      } catch {}
    }
  }, [storageKey]);

  // initial placement under the button on first open
  useEffect(() => {
    if (!open || pos.x !== null || !anchorRef.current) return;
    const btn = anchorRef.current.querySelector("button");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const panelW = 320;
    const left = Math.min(Math.max(rect.right - panelW, 8), window.innerWidth - panelW - 8);
    setPos({ x: left, y: top });
  }, [open, pos.x, top]);

  // persist position
  useEffect(() => {
    if (pos.x === null || pos.y === null) return;
    localStorage.setItem(storageKey, JSON.stringify(pos));
  }, [pos, storageKey]);

  // drag handlers
  useEffect(() => {
    const onMove = (clientX: number, clientY: number) => {
      if (!dragging || pos.x === null || pos.y === null || !panelRef.current) return;
      const w = panelRef.current.offsetWidth || 320;
      const h = panelRef.current.offsetHeight || 300;
      const X = clientX - dragRef.current.dx;
      const Y = clientY - dragRef.current.dy;
      const x = Math.min(Math.max(8, X), window.innerWidth - w - 8);
      const y = Math.min(Math.max(8, Y), window.innerHeight - h - 8);
      setPos({ x, y });
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY);
    };
    const stop = () => setDragging(false);

    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", stop);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", stop);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
    };
  }, [dragging, pos.x, pos.y]);

  const startDrag = (clientX: number, clientY: number) => {
    if (!panelRef.current || pos.x === null || pos.y === null) return;
    dragRef.current.dx = clientX - pos.x;
    dragRef.current.dy = clientY - pos.y;
    setDragging(true);
  };

  return (
    <div ref={anchorRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-block rounded bg-neutral-200 px-3 py-2 text-sm text-black hover:bg-neutral-300"
      >
        Page Building Cheat Sheet
      </button>

      {open && pos.x !== null && pos.y !== null && (
        <div
          ref={panelRef}
          className="fixed z-50 w-96 rounded-2xl border border-neutral-200 bg-white shadow-lg"
          style={{ left: pos.x, top: pos.y }}
        >
          <div
            className="cursor-move select-none rounded-t-2xl bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600 border-b"
            onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
            onTouchStart={(e) => { const t = e.touches[0]; if (t) startDrag(t.clientX, t.clientY); }}
          >
            {pageTitle ?? "Page"}{pageKind ? ` • ${pageKind}` : ""}{dragging ? " (dragging)" : ""}
          </div>

          <div className="p-3">
            {sections.map((sec, si) => (
              <section key={si} className="mb-4 last:mb-0">
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {sec.title}
                </h4>
                <ul className="space-y-1.5 text-sm">
                  {sec.items.map((it, i) => {
                    if (typeof it === "string") {
                      return <li key={i} className="leading-snug">• {it}</li>;
                    }
                    // link item
                    return (
                      <li key={i} className="leading-snug">
                        • <a href={it.href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {it.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
