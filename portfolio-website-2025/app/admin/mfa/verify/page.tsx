'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function MfaVerify() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (!factorId) return;
    setSubmitting(true);

    const { data: chall, error: challErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challErr) { setErr(challErr.message); setSubmitting(false); return; }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: chall.id,
      code,
    });
    if (verifyErr) { setErr(verifyErr.message); setSubmitting(false); return; }

    await fetch('/api/mfa/ok', { method: 'POST' });
    router.replace('/admin');
  }

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-br from-neutral-100 via-white to-neutral-100 px-4">
        <p className="text-sm text-neutral-600">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-neutral-100 via-white to-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          <h1 className="mb-2 text-xl font-semibold text-black">Enter 2FA Code</h1>
          <p className="mb-6 text-sm text-neutral-600">
            Please open your authenticator app and enter the 6-digit code.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black" htmlFor="code">Authentication Code</label>
              <input
                id="code"
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-center text-lg tracking-widest
                           outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
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
              {submitting ? 'Verifying…' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
