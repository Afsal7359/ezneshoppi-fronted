import { serverFetch } from '@/lib/server-fetch';
import ProductDetail from './ProductDetail';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getProduct(slug) {
  return serverFetch(`${API_URL}/api/products/${slug}`, { cache: 'no-store' });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  const product = data?.product;

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const image = product.images?.[0] || null;
  const price = product.price
    ? `₹${product.price.toLocaleString('en-IN')}`
    : '';
  const description = [
    product.shortDescription || product.description || '',
    price ? `Price: ${price}` : '',
  ].filter(Boolean).join(' — ');

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/product/${slug}`,
      type: 'website',
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: product.name }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
