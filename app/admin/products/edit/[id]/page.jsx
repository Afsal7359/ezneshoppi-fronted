'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { API } from '@/lib/api';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    API.product(id).then(({ data }) => setProduct(data.product));
  }, [id]);

  if (!product) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <ProductForm initialData={product} productId={product._id} />
    </div>
  );
}
