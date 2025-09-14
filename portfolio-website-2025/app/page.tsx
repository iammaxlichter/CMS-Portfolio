// app/page.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  fadeAfter?: number;
};

export default function Home() {
  return (
    <div className="font-sans p-0">
      <HoverFloatField />
    </div>
  );
}

function HoverFloatField() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cleanupTimers = useRef<number[]>([]);

  const BASE_HEIGHT = 0.88 * (typeof window !== "undefined" ? window.innerHeight : 800);
  const MAX_PARTICLES = 120;

  const spawn = useCallback((x: number, y: number, options?: Partial<Particle>) => {
    idRef.current += 1;
    const size = options?.size ?? rand(6, 16);
    const duration = options?.duration ?? rand(1800, 3500); // ms
    const fadeAfter = options?.fadeAfter ?? rand(800, 1400);
    const p: Particle = { id: idRef.current, x, y, size, duration, fadeAfter };
    setParticles((prev) => {
      const next = [...prev, p];

      if (next.length > MAX_PARTICLES) next.splice(0, next.length - MAX_PARTICLES);
      return next;
    });

    const t = window.setTimeout(() => {
      setParticles((prev) => prev.filter((pp) => pp.id !== p.id));
    }, duration + 60);
    cleanupTimers.current.push(t);
  }, []);

  const baseSquares = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => {
        const left = [85, 12, 70, 42, 65, 15][i];
        const w = [80, 30, 100, 150, 40, 110][i];
        const delay = [0, 1500, 5500, 0, 0, 3500][i];
        const dur = [20000, 10000, 20000, 15000, 20000, 20000][i];
        return { i, left, w, delay, dur };
      }),
    []
  );

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let k = 0; k < 3; k++) {
      spawn(
        x + rand(-12, 12),
        y + rand(-6, 6),
        {
          size: rand(5, 12),
          duration: rand(1500, 2800),
          fadeAfter: rand(700, 1200),
        }
      );
    }
  }, [spawn]);

  const handleEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.width / 2;
    const y = rect.height * 0.7;
    for (let i = 0; i < 10; i++) {
      spawn(x + rand(-100, 100), y + rand(-40, 40), {
        size: rand(6, 14),
        duration: rand(1600, 3200),
        fadeAfter: rand(600, 1100),
      });
    }
  }, [spawn]);

  const clearAll = useCallback(() => {
    cleanupTimers.current.forEach((t) => clearTimeout(t));
    cleanupTimers.current = [];
  }, []);

  return (
    <div
      ref={wrapRef}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={clearAll}
      className="relative w-full overflow-hidden"
      style={{ height: "88vh" }}
    >

      <div className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(to right, #9D231B, #c25643)" }} />

      <KineticHeadline />

      <ul className="absolute inset-0 m-0 p-0 overflow-hidden list-none pointer-events-none">
        {baseSquares.map(({ i, left, w, delay, dur }) => (
          <li
            key={i}
            style={{
              left: `${left}%`,
              width: `${w}px`,
              height: `${w}px`,
              animationDelay: `${delay}ms`,
              animationDuration: `${dur}ms`,
            }}
            className="absolute bottom-[-150px] bg-white/20 animate-floatSpin"
          />
        ))}
      </ul>

      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => {
          const delay = p.fadeAfter ?? 900;
          const fadeDur = Math.max(0, p.duration - delay);
          return (
            <span
              key={p.id}
              className="absolute rounded-[2px] bg-white/20 will-change-transform opacity-100"
              style={{
                left: p.x - p.size / 2,
                top: p.y - p.size / 2,
                width: p.size,
                height: p.size,
                animation: `rise ${p.duration}ms linear forwards, fade ${fadeDur}ms linear ${delay}ms forwards`,
              }}
            />
          );
        })}
      </div>

      <style jsx>{`
  @keyframes floatSpin {
    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-800px) rotate(360deg); opacity: 0; }
  }
  .animate-floatSpin { animation: floatSpin linear infinite; }

  @keyframes rise {
    from { transform: translate3d(0, 0, 0); }
    to   { transform: translate3d(0, -260px, 0); }
  }

  @keyframes fade {
    to { opacity: 0; }
  }
`}</style>
    </div>
  );
}


function KineticHeadline() {
  return (
    <div className="relative z-10 h-full w-full flex items-center justify-center text-center px-6 overflow-hidden">
      <div className="absolute inset-0">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
      </div>

      <div className="absolute" style={{ width: 0, height: 0 }}>
        <span className="ring-pulse ring2" />
        <span className="ring-pulse ring3" />
        <span className="ring-pulse ring4" />
      </div>

      <div
        className="absolute inset-0 opacity-20 animate-meshMove"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,225,220,0.4) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)
          `
        }}
      />

      <div className="relative">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[42vw] max-w-[560px] aspect-square rounded-full blur-3xl opacity-40 animate-glowPulse"
          style={{
            background: "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,.8), rgba(255,225,220,.4), rgba(255,255,255,0))"
          }}
        />

        <h1 className="leading-tight">
          <span className="block text-white/90 text-lg md:text-xl font-light tracking-wide mb-2">
            {"I'm a Software Engineer, my name is".split("").map((char, i) => (
              <span
                key={i}
                className="inline-block"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>

          <span className="relative inline-block group">
            <span
              className="relative block font-extrabold tracking-[-0.02em] animate-nameEntrance transform-gpu will-change-transform"
              style={{
                fontSize: "clamp(40px, 7vw, 88px)",
                background: "linear-gradient(135deg, #ffffff 0%, #ffe1dc 25%, #ffffff 50%, #f0f0f0 75%, #ffffff 100%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 4px 20px rgba(0,0,0,.2)",
                filter: "drop-shadow(0 2px 8px rgba(255,255,255,.1))",
              }}
            >
              Max Lichter

              <span className="absolute inset-0 overflow-hidden rounded-md pointer-events-none">
                <span className="sheen-enhanced block h-full w-[35%]" />
              </span>

              <span className="sparkles absolute inset-0 pointer-events-none">
                <span className="sparkle sparkle-1">✦</span>
                <span className="sparkle sparkle-2">✧</span>
                <span className="sparkle sparkle-3">✦</span>
                <span className="sparkle sparkle-4">✧</span>
              </span>
            </span>
          </span>


        </h1>
      </div>

      <style jsx>{`
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(255,255,255,0.8), transparent);
          border-radius: 50%;
          animation: float 20s infinite ease-in-out;
        }
        .particle-1 { top: 20%; left: 10%; animation-delay: 0s; animation-duration: 25s; }
        .particle-2 { top: 60%; right: 15%; animation-delay: 5s; animation-duration: 18s; }
        .particle-3 { bottom: 30%; left: 20%; animation-delay: 10s; animation-duration: 22s; }
        .particle-4 { top: 40%; right: 30%; animation-delay: 15s; animation-duration: 28s; }
        .particle-5 { bottom: 60%; right: 10%; animation-delay: 8s; animation-duration: 20s; }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(20px) rotate(90deg); opacity: 0.8; }
          50% { transform: translateY(-60px) translateX(-10px) rotate(180deg); opacity: 0.4; }
          75% { transform: translateY(-40px) translateX(30px) rotate(270deg); opacity: 0.7; }
        }

        @keyframes meshMove {
          0%, 100% { transform: rotate(0deg) scale(1); }
          33% { transform: rotate(1deg) scale(1.05); }
          66% { transform: rotate(-0.5deg) scale(0.98); }
        }
        .animate-meshMove { animation: meshMove 15s ease-in-out infinite; }

        @keyframes glowPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.6; }
        }
        .animate-glowPulse { animation: glowPulse 4s ease-in-out infinite; }

        .sparkles { opacity: 0; transition: opacity 600ms ease; }
        .group:hover .sparkles { opacity: 1; }
        
        .sparkle {
          position: absolute;
          font-size: 16px;
          color: rgba(255,255,255,0.9);
          animation: sparkle 1200ms ease-in-out infinite;
          pointer-events: none;
        }
        .sparkle-1 { top: 10%; left: 15%; animation-delay: 0ms; }
        .sparkle-2 { top: 80%; right: 20%; animation-delay: 300ms; }
        .sparkle-3 { top: 30%; right: 15%; animation-delay: 600ms; }
        .sparkle-4 { top: 70%; left: 20%; animation-delay: 900ms; }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }

        @keyframes taglineSlide {
          from { opacity: 0; transform: translateY(25px) translateX(-20px); }
          to { opacity: 1; transform: translateY(0) translateX(0); }
        }
        .animate-taglineSlide { 
          animation: taglineSlide 1000ms cubic-bezier(.2,.7,.2,1) both;
          animation-delay: 800ms;
        }

        .perspective-container { perspective: 200px; }
        .roller-3d {
          display: inline-block;
          line-height: 1.4em;
          animation: roll3d 12s cubic-bezier(.4,.2,.6,1) infinite;
          transform-style: preserve-3d;
        }
        .roller-item-3d { 
          display: block; 
          white-space: nowrap; 
          padding: 0 0.15em;
          transition: all 400ms ease;
        }

        .ring-pulse {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 9999px;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(255,255,255,.3);
          opacity: .1;
          animation: ring 18s cubic-bezier(.2,.7,.2,1) infinite;
          mix-blend-mode: screen;
        }
        
        .ring2 { 
          width: 25vmin; height: 25vmin; 
          animation-delay: 1.5s; 
          border-width: 1px;
        }
        .ring3 { 
          width: 35vmin; height: 35vmin; 
          animation-delay: 3s; 
          border-width: 0.5px;
          opacity: 0.2;
        }
        .ring4 { 
          width: 45vmin; height: 45vmin; 
          animation-delay: 4.5s; 
          border-width: 0.5px;
          opacity: 0.15;
        }

        @keyframes ring {
          0% { 
            transform: translate(-50%, -50%) scale(0.4); 
            opacity: .4; 
            border-color: rgba(255,255,255,.6);
          }
          50% { 
            opacity: .2; 
            border-color: rgba(255,225,220,.4);
          }
          100% { 
            transform: translate(-50%, -50%) scale(2.5); 
            opacity: 0;
            border-color: rgba(255,255,255,.1);
          }
        }
      `}</style>
    </div>
  );
}

function OrbitalWords() {
  const words = ["Delightful UIs", "Fast APIs", "Accessible UX", "Scalable Systems"];
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="orbit">
        {words.map((w, i) => (
          <span key={w} className="orbit-item" style={{ ["--i" as any]: i }}>
            {w}
          </span>
        ))}
      </div>

      <style jsx>{`
        .orbit {
          position: relative;
          width: clamp(280px, 42vmin, 520px);
          height: clamp(280px, 42vmin, 520px);
          border-radius: 9999px;
          animation: orbit-rotate 18s linear infinite;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,.25));
        }
        .orbit-item {
          --count: 4;
          position: absolute;
          left: 50%; top: 50%;
          transform:
            rotate(calc((360deg / var(--count)) * var(--i)))
            translateY(calc(-50% + -48%))
            rotate(calc((-360deg / var(--count)) * var(--i)));
          padding: 6px 10px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.12);
          color: #fff;
          font-size: clamp(10px, 1.6vmin, 14px);
          letter-spacing: .2px;
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.25);
          animation: orbit-item-float 3.6s ease-in-out infinite;
        }
        .orbit-item:nth-child(odd) { background: rgba(255,255,255,0.18); }
        @keyframes orbit-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbit-item-float {
          0%,100% { transform: translateY(-2px); }
          50%     { transform: translateY(2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .orbit, .orbit-item { animation: none; }
        }
      `}</style>
    </div>
  );
}

function FlipDescriptor() {
  return (
    <div className="mt-4 perspective-container text-white/90 text-xl md:text-2xl font-medium">
      <span className="inline-block roller-3d">
        <span className="roller-item-3d">I build delightful web apps</span>
        <span className="roller-item-3d">I craft snappy UIs</span>
        <span className="roller-item-3d">I ship scalable systems</span>
      </span>

      <style jsx>{`
        .perspective-container { perspective: 1000px; }
        .roller-3d {
          display: inline-block;
          transform-style: preserve-3d;
          animation: flip 8s cubic-bezier(.35,.2,.25,1) infinite;
        }
        .roller-item-3d {
          display: block;
          backface-visibility: hidden;
          height: 1.35em; line-height: 1.35em;
        }
        @keyframes flip {
          0%   { transform: rotateX(0deg); }
          26%  { transform: rotateX(0deg); }
          33%  { transform: rotateX(-90deg); }
          59%  { transform: rotateX(-90deg); }
          66%  { transform: rotateX(-180deg); }
          92%  { transform: rotateX(-180deg); }
          100% { transform: rotateX(-270deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .roller-3d { animation: none; }
        }
      `}</style>
    </div>
  );
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}