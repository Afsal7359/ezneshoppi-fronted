'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { API } from '@/lib/api';
import ImageUploader from '@/components/admin/ImageUploader';
import toast from 'react-hot-toast';
import Pagination from '@/components/admin/Pagination';

export default function AdminBlog() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const blank = { title: '', excerpt: '', content: '', coverImage: '', tags: [], isPublished: true };

  const load = () => {
    setLoading(true);
    API.blogs({ admin: true, page, limit: 25 })
      .then(({ data }) => {
        setItems(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const save = async () => {
    try {
      if (editing._id) await API.updateBlog(editing._id, editing);
      else await API.createBlog(editing);
      toast.success('Saved');
      setEditing(null);
      load();
    } catch { toast.error('Failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await API.deleteBlog(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-sm text-ink-500 mt-0.5">{loading ? '…' : `${total} post${total !== 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={() => setEditing(blank)} className="btn-primary"><Plus size={16} /> New Post</button>
      </div>

      {editing && (
        <div className="card p-5 mb-6 space-y-3">
          <div><label className="label">Title</label><input className="field" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
          <div><label className="label">Excerpt</label><input className="field" value={editing.excerpt || ''} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></div>
          <div><label className="label">Cover Image</label><ImageUploader multiple={false} images={editing.coverImage} onChange={(v) => setEditing({ ...editing, coverImage: v })} /></div>
          <div><label className="label">Content (Markdown/Plain)</label><textarea rows={10} className="field font-mono text-sm" value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
          <div><label className="label">Tags (comma-separated)</label><input className="field" value={(editing.tags || []).join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editing.isPublished} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} /> <span className="text-sm font-medium">Publish</span></label>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary"><Save size={14} /> Save</button>
            <button onClick={() => setEditing(null)} className="btn-outline"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card p-10 text-center text-ink-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-ink-500">No posts yet. Create your first one!</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((b) => (
            <div key={b._id} className="card overflow-hidden">
              <div className="relative aspect-[16/10] bg-ink-900/5">
                {b.coverImage && <Image src={b.coverImage} alt={b.title} fill className="object-cover" />}
              </div>
              <div className="p-4">
                <span className={`chip ${b.isPublished ? 'bg-green-50 text-green-700' : 'bg-ink-100 text-ink-500'} text-xs mb-2`}>
                  {b.isPublished ? 'Published' : 'Draft'}
                </span>
                <h3 className="font-semibold line-clamp-2">{b.title}</h3>
                <p className="text-xs text-ink-500 mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-1 mt-3">
                  <button onClick={() => setEditing(b)} className="btn-outline text-xs"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => del(b._id)} className="btn-outline text-xs text-red-600"><Trash2 size={12} /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
