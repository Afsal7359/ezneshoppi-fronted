import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getBlog(slug) {
  try {
    const res = await fetch(`${API_URL}/api/blog/${slug}`, { next: { revalidate: 60 } });
    return res.ok ? (await res.json()).blog : null;
  } catch { return null; }
}

export default async function BlogPostPage({ params }) {
  const b = await getBlog(params.slug);
  if (!b) notFound();

  return (
    <article className="container-x py-16 max-w-3xl">
      <Link href="/blog" className="text-sm text-brand-600 mb-4 inline-block">← All posts</Link>
      <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">{b.title}</h1>
      <p className="text-ink-500 mt-3">
        {b.authorName && <>By {b.authorName} · </>}
        {new Date(b.publishedAt || b.createdAt).toLocaleDateString()}
      </p>
      {b.coverImage && (
        <div className="relative aspect-[16/9] my-8 rounded-2xl overflow-hidden">
          <Image src={b.coverImage} alt={b.title} fill className="object-cover" />
        </div>
      )}
      <div className="prose max-w-none whitespace-pre-wrap text-ink-700 text-lg leading-relaxed">{b.content}</div>
    </article>
  );
}
