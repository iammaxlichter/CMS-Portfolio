'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { QRCodeSVG } from 'qrcode.react';

export default function MfaSetup() {
  const router = useRouter();
  const [uri, setUri] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/admin/signin?next=/admin'); return; }

      const { data: factors, error: lfErr } = await supabase.auth.mfa.listFactors();
      if (lfErr) { setErr(lfErr.message); setLoading(false); return; }
      const verified = factors.totp?.find(f => f.status === 'verified');
      if (verified) { router.replace('/admin'); return; }

      const { data: enroll, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) { setErr(error.message); setLoading(false); return; }

      setFactorId(enroll.id);
      setUri(enroll.totp.uri);
      setLoading(false);
    })();
  }, [router]);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (!factorId) return;

    const { data: chall, error: challErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challErr) { setErr(challErr.message); return; }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: chall.id,
      code,
    });
    if (verifyErr) { setErr(verifyErr.message); return; }

    router.replace('/admin/mfa/verify');
  }

  if (loading) return <main className="mx-auto max-w-sm p-6">Loading…</main>;

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-xl font-semibold">Set up 2FA</h1>

      {uri ? (
        <>
          <p className="text-sm">
            Scan this QR code with Google Authenticator, 1Password, or Authy. Then enter the 6-digit code.
          </p>

          <div className="flex justify-center">
            <QRCodeSVG value={uri} size={192} />
          </div>

          <details className="text-xs text-neutral-600">
            <summary>Can’t scan? Show secret (otpauth URI)</summary>
            <pre className="mt-2 break-all p-2 bg-neutral-100 rounded">{uri}</pre>
          </details>

          <form onSubmit={onVerify} className="space-y-2">
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
        </>
      ) : (
        <p className="text-sm text-red-600">{err || 'Could not create TOTP factor.'}</p>
      )}
    </main>
  );
}
