import { productMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import { PRODUCTS } from '@/lib/data';
import AppWrapper from '@/components/bachat/AppWrapper';
import { ProductJsonLd } from '@/components/seo/ProductStructuredData';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return productMetadata(Number(id));
}

export async function generateStaticParams() {
  return PRODUCTS.map(p => ({ id: String(p.id) }));
}

export default async function ProductPage({ params }: Props) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const product = PRODUCTS.find(p => p.id === id);

  return (
    <>
      {product && (
        <ProductJsonLd
          id={product.id}
          name={product.name}
          description={product.description}
          image={product.images[0]}
          price={product.price}
          oldPrice={product.oldPrice}
          rating={product.rating}
          reviews={product.reviews}
          stock={product.stock}
          brand={product.brand}
          sku={product.sku}
          category={product.category}
        />
      )}
      <AppWrapper initialPath={`/product/${id}`} />
    </>
  );
}