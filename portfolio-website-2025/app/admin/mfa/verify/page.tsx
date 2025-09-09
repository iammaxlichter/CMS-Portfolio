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

  // Ensure signed in, ensure a verified TOTP factor exists, load its id
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

    // Create a challenge, then verify the 6-digit code
    const { data: chall, error: challErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challErr) { setErr(challErr.message); return; }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: chall.id,
      code,
    });
    if (verifyErr) { setErr(verifyErr.message); return; }

    // Mark MFA OK for this session window (signed cookie, server will verify)
    await fetch('/api/mfa/ok', { method: 'POST' });

    router.replace('/admin');
  }

  if (loading) return <main className="mx-auto max-w-sm p-6">Loading…</main>;

  return (
    <main className="mx-auto max-w-sm min-h-screen p-6 space-y-3">
      <h1 className="text-xl font-semibold">Enter 2FA Code</h1>
      <form onSubmit={onSubmit} className="space-y-2">
        <input
          className="w-full rounded border p-2"
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          required
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="rounded bg-black text-white px-3 py-2">Verify</button>
      </form>
    </main>
  );
}
