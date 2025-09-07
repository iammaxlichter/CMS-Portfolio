'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  return (
    <button
      className="mt-4 rounded border px-3 py-2 disabled:opacity-60"
      disabled={busy}
      onClick={async () => {
        try {
          setBusy(true);
          await supabase.auth.signOut();
          await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'SIGNED_OUT', session: null }),
          });
          router.replace('/');
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
