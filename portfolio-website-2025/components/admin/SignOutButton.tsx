'use client';
import { supabase } from '@/lib/supabase/client';

export default function SignOutButton() {
  return (
    <button
      className="mt-4 rounded border px-3 py-2"
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      }}
    >
      Sign out
    </button>
  );
}
