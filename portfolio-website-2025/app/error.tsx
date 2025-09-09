// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: { error: Error & { digest?: string }, reset: () => void }) {
  console.error('App Error Boundary:', error, error?.cause);
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Something broke</h1>
      <pre className="mt-4 whitespace-pre-wrap text-sm">
        {String(error)}{"\n"}digest: {error?.digest ?? '—'}
      </pre>
      <button className="mt-4 border px-3 py-1 rounded" onClick={reset}>Try again</button>
    </div>
  );
}
