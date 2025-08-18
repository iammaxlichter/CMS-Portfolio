import WhoAmIClient from './whoami-client';
import { createClient } from '@/lib/supabase/server';

export default async function WhoAmIPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    role = data?.role ?? null;
  }

  return <WhoAmIClient user={user} role={role} />;
}
