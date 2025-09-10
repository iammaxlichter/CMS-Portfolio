// app/signin/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <Suspense fallback={<PageShell><p className="text-sm text-neutral-600">Loading…</p></PageShell>}>
      <SignInInner />
    </Suspense>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen grid place-items-center px-4 py-8 bg-gradient-to-br from-neutral-100 via-white to-neutral-100">
      {children}
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

function SignInInner() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/admin';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, session }),
      });
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setSubmitting(false);
    if (error) setErr(error.message);
    else router.replace(next);
  }

  return (
    <PageShell>
      <Card>
        <div className="p-6 sm:p-8">
          {/* Logo / Title */}
          <div className="mb-6 flex items-center gap-3">
          
            <div>
              <h1 className="text-xl font-semibold text-black">Sign in</h1>
              <p className="text-sm text-neutral-600">Access your admin dashboard</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black" htmlFor="email">Email</label>
              <input
                id="email"
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm outline-none transition
                           focus:border-black focus:ring-2 focus:ring-black/10"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black" htmlFor="password">Password</label>
              <input
                id="password"
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm outline-none transition
                           focus:border-black focus:ring-2 focus:ring-black/10"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
              />
            </div>

            {err && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {err}
              </p>
            )}

            <button
              className="w-full rounded-lg bg-black px-4 py-2.5 text-white text-sm font-medium transition
                         hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
              type="submit"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>

          </form>
        </div>
      </Card>
    </PageShell>
  );
}
