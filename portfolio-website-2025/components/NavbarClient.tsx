// components/NavbarClient.tsx

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

  // close on Esc + outside click (keep these)
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
    <div
      className="relative"                    // contains both button and menu
      onMouseEnter={() => setOpen(true)}      // open on hover
      onMouseLeave={() => setOpen(false)}     // close when leaving BOTH
    >
      <button
        type="button"
        ref={btnRef}
        className="inline-flex items-center gap-1 px-3 py-2 hover:text-white/90"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}    // also supports click
      >
        {label}
        <CaretDown />
      </button>

      {/* sit flush: no vertical gap */}
      <div
        role="menu"
        className={`absolute left-0 top-full z-50 min-w-48 rounded-lg bg-[#343330]  p-1 shadow-lg transition
          ${open ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none"}`}
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

      {/* optional tiny 'hover bridge' if your theme adds borders causing gaps */}
      {/* <div className="absolute left-0 right-0 top-full h-2" /> */}
    </div>
  );
}


export default function NavbarClient({
  projects,
  experience,
  standalones = [],

}: {
  projects: Item[];
  experience: Item[];
  standalones?: Item[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#343330] text-white">
      <nav className="mx-auto flex max-w-7xl items-center text-[15px] justify-between px-4 py-4.5 mr-4 ml-4 md:px-6" aria-label="Main">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <Image
            src="/images/other/logoWhite.png"
            alt="Your Logo"
            width={64}
            height={48}
            className="d-inline-block align-top"
            priority
          />
          <span className="sr-only">Home</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/" className="px-3 py-2 hover:text-white/90">Home</Link>
          <Dropdown label="Projects" items={projects} />
          <Dropdown label="Experience" items={experience} />
          {standalones.map((it) => (
            <Link key={it.href} href={it.href} className="px-3 py-2 hover:text-white/90">
              {it.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden inline-flex flex-col items-center justify-center rounded p-2 hover:bg-white/10"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white my-1" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>

      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#343330] px-4 py-3 space-y-1">
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

          {standalones.map((it) => (
            <Link
              key={`m-standalone-${it.href}`}
              href={it.href}
              className="block rounded px-3 py-2 hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
