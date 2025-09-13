// app/error.tsx
"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("App Error Boundary:", error, error?.cause);
    }
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-red-700">Something went wrong</h1>
      <p className="mt-2 text-sm text-neutral-700">
        {isDev
          ? "Development mode: full error details below."
          : "An unexpected error occurred. You can try again."}
      </p>

      {isDev ? (
        <details className="mt-4 rounded border bg-neutral-50 p-3 text-sm" open>
          <summary className="cursor-pointer font-medium">Error details</summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed">
            {String(error)}
            {"\n"}
            digest: {error?.digest ?? "—"}
            {"\n"}
            stack: {error?.stack ?? "—"}
          </pre>
        </details>
      ) : (
        <p className="mt-3 text-xs text-neutral-600">
          Reference: <span className="font-mono">{error?.digest ?? "—"}</span>
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={reset}
          className="border px-3 py-1 rounded hover:bg-neutral-100"
        >
          Try again
        </button>
        <a
          href="/"
          className="border px-3 py-1 rounded hover:bg-neutral-100"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
