// /components/NavbarClient.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Item = { label: string; href: string };

const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(" ");

function CaretDown({ className = "h-3.5 w-3.5", rotated = false }: { className?: string; rotated?: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      animate={{ rotate: rotated ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.16l-4.24 3.36a.75.75 0 0 1-.94 0L5.25 8.39a.75.75 0 0 1-.02-1.18z" />
    </motion.svg>
  );
}

function Dropdown({ label, items }: { label: string; items: Item[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const parentActive = items.some((it) => it.href === pathname);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cx(
          "group relative inline-flex items-center gap-1 px-3 py-2 transition-colors",
          parentActive ? "font-bold text-white" : "hover:text-white/90"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {/* animated underline */}
        <span className="relative">
          {label}
          <span
            className="pointer-events-none absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-white/70 transition-transform duration-200 group-hover:scale-x-100"
            aria-hidden
          />
        </span>
        <CaretDown rotated={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="absolute left-0 top-full z-50 min-w-48 rounded-lg bg-[#343330] p-1 shadow-lg ring-1 ring-black/10"
          >
            {items.map((it, idx) => {
              const active = it.href === pathname;
              return (
                <motion.div
                  key={`${label}-${it.href}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * idx, type: "spring", stiffness: 400, damping: 28 }}
                >
                  <Link
                    href={it.href}
                    className={cx(
                      "block rounded-md px-3 py-2 text-sm text-white/90 transition",
                      "hover:bg-white/10 hover:text-white",
                      active && "font-bold text-white bg-white/10"
                    )}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    {it.label}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
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
  const pathname = usePathname();

  const projectsActive = projects.some((it) => it.href === pathname);
  const experienceActive = experience.some((it) => it.href === pathname);

  const topVar = {
    closed: { y: 0, rotate: 0 },
    open: { y: 6, rotate: 45 },
  };
  const midVar = {
    closed: { opacity: 1 },
    open: { opacity: 0 },
  };
  const botVar = {
    closed: { y: 0, rotate: 0 },
    open: { y: -6, rotate: -45 },
  };

  return (
    <header className="sticky top-0 z-50 bg-[#343330] text-white">
      <nav className="flex items-center text-[15px] px-4 py-4.5 mr-4 ml-4 md:px-6" aria-label="Main">
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

        {/* Desktop */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className={cx(
              "group relative px-3 py-2 transition-colors hover:text-white/90",
              pathname === "/" && "font-bold text-white"
            )}
          >
            Home
            <span
              className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-white/70 transition-transform duration-200 group-hover:scale-x-100"
              aria-hidden
            />
          </Link>

          <Dropdown label="Projects" items={projects} />
          <Dropdown label="Experience" items={experience} />

          {standalones.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cx(
                  "group relative px-3 py-2 transition-colors hover:text-white/90",
                  active && "font-bold text-white"
                )}
              >
                {it.label}
                <span
                  className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-white/70 transition-transform duration-200 group-hover:scale-x-100"
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>

        {/* Hamburger */}
        <motion.button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden ml-auto inline-flex flex-col items-center justify-center rounded p-2 hover:bg-white/10"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          whileTap={{ scale: 0.96 }}
        >
          <motion.span
            className="block h-0.5 w-6 bg-white"
            variants={topVar}
            animate={mobileOpen ? "open" : "closed"}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
          <motion.span
            className="block h-0.5 w-6 bg-white my-1"
            variants={midVar}
            animate={mobileOpen ? "open" : "closed"}
            transition={{ duration: 0.12 }}
          />
          <motion.span
            className="block h-0.5 w-6 bg-white"
            variants={botVar}
            animate={mobileOpen ? "open" : "closed"}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        </motion.button>
      </nav>

      {/* Mobile panel */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            key="mobile-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="md:hidden border-t border-white/10 bg-[#343330] px-4 py-3 space-y-1"
          >
            <Link
              href="/"
              className={cx(
                "block rounded px-3 py-2 hover:bg-white/10 transition",
                pathname === "/" && "font-bold bg-white/10"
              )}
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>

            <details className="group" open>
              <summary className="flex cursor-pointer list-none items-center justify-between rounded px-3 py-2 hover:bg-white/10 transition">
                <span className={projectsActive ? "font-bold" : undefined}>Projects</span>
                <CaretDown className="h-4 w-4" rotated />
              </summary>
              <div className="mt-1 space-y-1 pl-4">
                {projects.map((it, i) => (
                  <motion.div
                    key={`m-projects-${it.href}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.02 * i, type: "spring", stiffness: 360, damping: 30 }}
                  >
                    <Link
                      href={it.href}
                      className={cx(
                        "block rounded px-3 py-2 text-sm hover:bg-white/10 transition",
                        pathname === it.href && "font-bold bg-white/10"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {it.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </details>

            <details className="group" open>
              <summary className="flex cursor-pointer list-none items-center justify-between rounded px-3 py-2 hover:bg-white/10 transition">
                <span className={experienceActive ? "font-bold" : undefined}>Experience</span>
                <CaretDown className="h-4 w-4" rotated />
              </summary>
              <div className="mt-1 space-y-1 pl-4">
                {experience.map((it, i) => (
                  <motion.div
                    key={`m-exp-${it.href}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.02 * i, type: "spring", stiffness: 360, damping: 30 }}
                  >
                    <Link
                      href={it.href}
                      className={cx(
                        "block rounded px-3 py-2 text-sm hover:bg-white/10 transition",
                        pathname === it.href && "font-bold bg-white/10"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {it.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </details>

            {standalones.map((it, i) => (
              <motion.div
                key={`m-standalone-${it.href}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * i, type: "spring", stiffness: 360, damping: 30 }}
              >
                <Link
                  href={it.href}
                  className={cx(
                    "block rounded px-3 py-2 hover:bg-white/10 transition",
                    pathname === it.href && "font-bold bg-white/10"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {it.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
