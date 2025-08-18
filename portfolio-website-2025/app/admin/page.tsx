import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/SignOutButton';

export default async function AdminPage() {
  const supabase = await createClient();

  // Must be signed in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  // Must be admin (uses your profiles table)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') redirect('/');

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-2 text-neutral-600">
        You’re signed in as admin. Next we’ll add Projects/Experiences and the drag-and-drop builder.
      </p>

      <SignOutButton/>
    </main>
  );
}
