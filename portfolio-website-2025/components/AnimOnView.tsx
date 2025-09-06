"use client";
import { useEffect, useRef, useState, PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
  durationMs?: number;
  delayMs?: number;
  /** minimum ratio to allow (used as a fallback for very tall elements) */
  threshold?: number;   // e.g. 0.2
  /** require the whole element to be inside the viewport before playing */
  requireFull?: boolean;
  /** play once and stay visible */
  once?: boolean;
}>;

export default function AnimOnView({
  children,
  className = "",
  durationMs = 600,
  delayMs = 0,
  threshold = 0.1,      // ✅ low, so tall elements can still animate
  requireFull = true,   // ✅ “full in view” by default
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const thresholds = [0, 0.1, 0.2, 0.25, 0.5, 0.75, 0.9, 0.99, 1];

    const isFullyVisible = (entry: IntersectionObserverEntry) => {
      const r = entry.boundingClientRect;
      // Fallback if rootBounds is null (iOS Safari sometimes)
      const rootTop = entry.rootBounds?.top ?? 0;
      const rootBottom =
        entry.rootBounds?.bottom ?? window.innerHeight;
      return r.top >= rootTop && r.bottom <= rootBottom;
    };

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        const ok =
          (requireFull && isFullyVisible(e)) ||
          (!requireFull && e.intersectionRatio >= threshold);

        if (e.isIntersecting && ok) {
          setRunning(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setRunning(false);
        }
      },
      { threshold: thresholds }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, requireFull, once]);

  const style: React.CSSProperties & Record<"--anim-dur" | "--anim-delay", string> = {
    "--anim-dur": `${durationMs}ms`,
    "--anim-delay": `${delayMs}ms`,
  };

  return (
    <div
      ref={ref}
      className={`${className} ${running ? "anim-running" : "anim-paused"}`}
      style={style}
    >
      {children}
    </div>
  );
}
