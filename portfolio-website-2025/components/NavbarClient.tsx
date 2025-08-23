"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function CaretDown({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.16l-4.24 3.36a.75.75 0 0 1-.94 0L5.25 8.39a.75.75 0 0 1-.02-1.18z" />
    </svg>
  );
}

type Item = { label: string; href: string };

function Dropdown({ label, items }: { label: string; items: Item[] }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!btnRef.current) return;
      if (!btnRef.current.parentElement?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        ref={btnRef}
        className="inline-flex items-center gap-1 px-3 py-2 hover:text-white/90"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <CaretDown />
      </button>

      <div
        role="menu"
        className={`absolute left-0 mt-3 min-w-48 rounded-lg bg-black backdrop-blur p-1 shadow-lg transition
          ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}`}
      >
        {items.map((it) => (
          <Link
            key={`${label}-${it.href}`}
            href={it.href}
            className="block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function NavbarClient({
  projects,
  experience,
}: {
  projects: Item[];
  experience: Item[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-neutral-800 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6" aria-label="Main">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-white text-neutral-900 font-bold">
            ML
          </span>
          <span className="sr-only">Home</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/" className="px-3 py-2 hover:text-white/90">Home</Link>
          <Dropdown label="Projects" items={projects} />
          <Dropdown label="Experience" items={experience} />
          <Link href="/resume" className="px-3 py-2 hover:text-white/90">Resume</Link>
          <Link href="/contact" className="px-3 py-2 hover:text-white/90">Contact</Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center rounded p-2 hover:bg-white/10"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className="block h-0.5 w-6 bg-white"></span>
          <span className="mt-1 block h-0.5 w-6 bg-white"></span>
          <span className="mt-1 block h-0.5 w-6 bg-white"></span>
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-neutral-800 px-4 py-3 space-y-1">
          <Link href="/" className="block rounded px-3 py-2 hover:bg-white/10" onClick={() => setMobileOpen(false)}>
            Home
          </Link>

          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded px-3 py-2 hover:bg-white/10">
              <span>Projects</span>
              <CaretDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="mt-1 space-y-1 pl-4">
              {projects.map((it) => (
                <Link key={`m-projects-${it.href}`} href={it.href} className="block rounded px-3 py-2 text-sm hover:bg-white/10" onClick={() => setMobileOpen(false)}>
                  {it.label}
                </Link>
              ))}
            </div>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded px-3 py-2 hover:bg-white/10">
              <span>Experience</span>
              <CaretDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="mt-1 space-y-1 pl-4">
              {experience.map((it) => (
                <Link key={`m-exp-${it.href}`} href={it.href} className="block rounded px-3 py-2 text-sm hover:bg-white/10" onClick={() => setMobileOpen(false)}>
                  {it.label}
                </Link>
              ))}
            </div>
          </details>

          <Link href="/resume" className="block rounded px-3 py-2 hover:bg-white/10" onClick={() => setMobileOpen(false)}>Resume</Link>
          <Link href="/contact" className="block rounded px-3 py-2 hover:bg-white/10" onClick={() => setMobileOpen(false)}>Contact</Link>
        </div>
      )}
    </header>
  );
}
