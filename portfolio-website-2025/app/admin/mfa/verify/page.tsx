'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function MfaVerify() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const lastTried = useRef('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/admin/signin?next=/admin'); return; }
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) { setErr(error.message); setLoading(false); return; }
      const verified = data.totp?.find(f => f.status === 'verified');
      if (!verified) { router.replace('/admin/mfa/setup'); return; }
      setFactorId(verified.id);
      setLoading(false);
    })();
  }, [router]);

  async function verifyFlow(c: string) {
    if (!factorId || submitting) return;
    setSubmitting(true); setErr('');
    const { data: chall, error: challErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challErr) { setErr(challErr.message); setSubmitting(false); return; }
    const { error: verifyErr } = await supabase.auth.mfa.verify({ factorId, challengeId: chall.id, code: c });
    if (verifyErr) { setErr(verifyErr.message); setSubmitting(false); return; }
    await fetch('/api/mfa/ok', { method: 'POST' });
    router.replace('/admin');
  }

  useEffect(() => {
    if (code.length === 6 && factorId && !submitting && lastTried.current !== code) {
      lastTried.current = code;
      void verifyFlow(code);
    }
  }, [code, factorId, submitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length === 6) { lastTried.current = code; await verifyFlow(code); }
  }

  if (loading) return <main className="min-h-screen grid place-items-center px-4">Loading…</main>;

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          <h1 className="mb-2 text-xl font-semibold">Enter 2FA Code</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              id="code"
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="w-full rounded border p-2.5 text-center text-lg tracking-widest"
              value={code}
              onChange={(e) => { setErr(''); setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); }}
              onPaste={(e) => {
                const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                if (digits) { e.preventDefault(); setCode(digits); }
              }}
              disabled={submitting}
              required
            />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="w-full rounded bg-black px-4 py-2.5 text-white disabled:opacity-60"
              disabled={submitting || code.length !== 6} type="submit">
              {submitting ? 'Verifying…' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
