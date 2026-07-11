'use client';

import Script from 'next/script';

interface ProductJsonLdProps {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviews: number;
  stock: number;
  brand: string;
  sku: string;
  category: string;
}

export function ProductJsonLd({ id, name, description, image, price, oldPrice, rating, reviews, stock, brand, sku, category }: ProductJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description.slice(0, 5000),
    image,
    sku,
    brand: { '@type': 'Brand', name: brand },
    category,
    offers: {
      '@type': 'Offer',
      url: `https://bachatbazar.pk/product/${id}`,
      priceCurrency: 'PKR',
      price: String(price),
      ...(oldPrice > price ? { highPrice: String(oldPrice) } : {}),
      availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Bachat Bazar' },
    },
    ...(rating > 0 && reviews > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(rating),
        reviewCount: String(reviews),
        bestRating: '5',
        worstRating: '1',
      },
    } : {}),
  };

  return (
    <Script
      id={`product-ld-${id}`}
      type="application/ld+json"
      strategy="beforeInteractive"
    >
      {JSON.stringify(data)}
    </Script>
  );
}