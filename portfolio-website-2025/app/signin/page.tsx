// app/signin/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic'; // avoid prerendering headaches

export default function SignInPage() {
  return (
    <Suspense fallback={<Shell><p>Loading…</p></Shell>}>
      <SignInInner />
    </Suspense>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-sm p-6">{children}</main>;
}

function SignInInner() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();
  const sp = useSearchParams();              // ← now inside Suspense
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
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setErr(error.message);
    else router.replace(next);
  }

  return (
    <Shell>
      <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Email"
               autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Password" type="password"
               autoComplete="current-password" value={pw} onChange={e=>setPw(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="rounded bg-black px-4 py-2 text-white">Sign in</button>
      </form>
    </Shell>
  );
}
