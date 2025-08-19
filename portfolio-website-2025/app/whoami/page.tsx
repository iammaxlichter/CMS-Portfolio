import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminPages() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || profile.role !== 'admin') return null;

  const { data: pages } = await supabase.from('pages').select('*').order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Pages</h1>
      <form action={createPage} className="flex flex-wrap gap-3 items-center">
        <input name="title" placeholder="Page title" className="rounded border p-2" required />
        <input name="slug" placeholder="slug" className="rounded border p-2" required />
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" name="kind_project" /> Project
        </label>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" name="kind_experience" /> Experience
        </label>
        <button className="rounded bg-black text-white px-3 py-2">Create</button>
      </form>

      <ul className="divide-y rounded border bg-white">
        {pages?.map(p => (
          <li key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-neutral-500">{p.kind} · /{p.slug}</div>
            </div>
            <Link className="text-blue-600" href={`/admin/pages/${p.id}`}>Edit</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

async function createPage(formData: FormData) {
  'use server';
  const supabase = await (await import('@/lib/supabase/server')).createClient();
  const title = String(formData.get('title'));
  const slug = String(formData.get('slug'));
  const isProject = !!formData.get('kind_project');
  const isExperience = !!formData.get('kind_experience');
  const kind = isProject ? 'project' : (isExperience ? 'experience' : 'standalone');

  await supabase.from('pages').insert({ title, slug, kind, published: false });
}
