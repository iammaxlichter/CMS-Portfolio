'use client';

import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export default function WhoAmIClient({ user, role }: { user: User | null; role: string | null }) {
  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/signin';
  }

  return (
    <div className="p-6">
      <pre className="text-sm">
        {JSON.stringify({ userId: user?.id, email: user?.email, role }, null, 2)}
      </pre>
      {user && (
        <button
          onClick={handleSignOut}
          className="mt-4 rounded border px-3 py-2"
        >
          Sign out
        </button>
      )}
    </div>
  );
}
