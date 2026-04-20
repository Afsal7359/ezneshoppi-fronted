import Link from 'next/link';
import Image from 'next/image';
import { serverFetch } from '@/lib/server-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getBlogs() {
  const data = await serverFetch(`${API_URL}/api/blog?limit=20`, { next: { revalidate: 60 } });
  return data?.items || [];
}

export const metadata = { title: 'Blog' };

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="container-x py-16">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Blog</h1>
        <p className="text-ink-500 mt-3 text-sm sm:text-base">Insights, reviews, and tech stories.</p>
      </div>
      {blogs.length === 0 ? (
        <p className="text-center text-ink-500">No posts yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <Link key={b._id} href={`/blog/${b.slug}`} className="group card overflow-hidden">
              <div className="relative aspect-[16/10] bg-ink-900/5">
                {b.coverImage && <Image src={b.coverImage} alt={b.title} fill className="object-cover group-hover:scale-105 transition duration-500" />}
              </div>
              <div className="p-5">
                <p className="text-xs text-ink-500 mb-1">{new Date(b.publishedAt || b.createdAt).toLocaleDateString()}</p>
                <h3 className="font-semibold text-lg leading-tight line-clamp-2">{b.title}</h3>
                {b.excerpt && <p className="text-sm text-ink-500 mt-2 line-clamp-3">{b.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
