'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AdminSignin() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = sp.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (error) {
      setErr(error.message);
      return;
    }

    router.replace(nextUrl);
  }

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-neutral-100 via-white to-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          <h1 className="mb-2 text-xl font-semibold text-black">Admin Sign In</h1>
          <p className="mb-6 text-sm text-neutral-600">
            Enter your credentials to access the admin dashboard.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-black">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm outline-none transition
                           focus:border-black focus:ring-2 focus:ring-black/10"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-black">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm outline-none transition
                           focus:border-black focus:ring-2 focus:ring-black/10"
                placeholder="••••••••"
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
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
