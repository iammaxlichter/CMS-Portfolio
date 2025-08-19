// app/admin/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  const { data: profile } = await supabase.from('profiles')
    .select('role').eq('id', user.id).maybeSingle();
  if (!profile || profile.role !== 'admin') redirect('/');

  const { data: pages } = await supabase
    .from('pages')
    .select('id, title, slug, kind, published, created_at')
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin · Pages</h1>

      <form action={createPage} className="flex flex-wrap items-center gap-3">
        <input name="title" placeholder="Page title" className="rounded border p-2" required />
        <input name="slug"  placeholder="slug (e.g. my-project)" className="rounded border p-2" required />
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" name="kind_project" /> Project
        </label>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" name="kind_experience" /> Experience
        </label>
        <button className="rounded bg-black px-3 py-2 text-white">Create</button>
      </form>

      <ul className="divide-y rounded border bg-white">
        {(pages ?? []).map(p => (
          <li key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-neutral-500">{p.kind} · /{p.slug} · {p.published ? 'published' : 'draft'}</div>
            </div>
            <Link className="text-blue-600" href={`/admin/${p.id}`}>Edit</Link>
          </li>
        ))}
        {(!pages || pages.length === 0) && (
          <li className="p-4 text-sm text-neutral-500">No pages yet — create one above.</li>
        )}
      </ul>
    </main>
  );
}

async function createPage(formData: FormData) {
  'use server';
  const supabase = await (await import('@/lib/supabase/server')).createClient();
  const title = String(formData.get('title'));
  const slug  = String(formData.get('slug'));
  const kind  = formData.get('kind_project')
    ? 'project'
    : formData.get('kind_experience')
    ? 'experience'
    : 'standalone';

  await supabase.from('pages').insert({ title, slug, kind, published: false });
}
