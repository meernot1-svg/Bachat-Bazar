import type { Metadata } from 'next';
import { PRODUCTS, CATEGORIES } from './data';

const BASE = 'https://bachatbazar.pk';

/** Truncate string to maxLen characters */
function truncate(s: string, maxLen: number) {
  return s.length > maxLen ? s.slice(0, maxLen).trimEnd() + '…' : s;
}

/** Homepage metadata */
export function homeMetadata(): Metadata {
  return {
    title: "Bachat Bazar | Pakistan's #1 Online Shopping Marketplace - Best Deals & Prices",
    description: truncate("Bachat Bazar is Pakistan's leading online marketplace offering best prices on Health & Beauty, Grocery, Electronics, Fashion, Home Appliances, Baby Products & more. Free delivery on orders over Rs 25,000. Cash on Delivery available nationwide.", 160),
    alternates: { canonical: BASE },
    openGraph: {
      title: "Bachat Bazar | Pakistan's #1 Online Shopping Marketplace",
      description: "Shop best deals on Electronics, Beauty, Fashion, Grocery & more. Free delivery Rs 25K+. COD available.",
      url: BASE,
      type: 'website',
      locale: 'en_PK',
      siteName: 'Bachat Bazar',
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: 'Bachat Bazar - Pakistan\'s Online Marketplace' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Bachat Bazar | Pakistan's #1 Online Marketplace",
      description: "Best prices on electronics, beauty, fashion & more. Free delivery Rs 25K+",
      images: `${BASE}/og-image.png`,
      creator: '@bachatbazar',
    },
  };
}

/** /shop page metadata */
export function shopMetadata(query?: Record<string, string>): Metadata {
  const category = query?.category ? CATEGORIES.find(c => c.id === query.category) : null;
  const search = query?.search;
  const title = category
    ? `${category.name} - Bachat Bazar | Best Prices in Pakistan`
    : search
    ? `Search: ${search} - Bachat Bazar`
    : "Shop All Products - Bachat Bazar | Pakistan's Online Marketplace";
  const description = category
    ? truncate(`Shop ${category.name} at Bachat Bazar. Best prices on ${category.name} in Pakistan with fast delivery and Cash on Delivery. Browse ${PRODUCTS.filter(p => p.category === category.id).length}+ products.`, 160)
    : search
    ? truncate(`Search results for "${search}" on Bachat Bazar. Find the best deals on electronics, beauty, fashion and more in Pakistan.`, 160)
    : truncate("Browse 300+ products at Bachat Bazar. Best deals on Health & Beauty, Electronics, Fashion, Home Appliances and more. Free delivery on Rs 25K+.", 160);
  const url = category ? `${BASE}/shop/${category.id}` : search ? `${BASE}/shop?search=${encodeURIComponent(search)}` : `${BASE}/shop`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', locale: 'en_PK', siteName: 'Bachat Bazar' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/** /product/[id] page metadata */
export function productMetadata(id: number): Metadata {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return { title: 'Product Not Found - Bachat Bazar' };

  const title = `${p.name} - Bachat Bazar | Rs ${p.price.toLocaleString()}`;
  const description = truncate(p.description, 160);
  const url = `${BASE}/product/${p.id}`;
  const imgUrl = p.images[0] || '';

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'en_PK',
      siteName: 'Bachat Bazar',
      images: imgUrl ? [{ url: imgUrl, width: 1200, height: 1200, alt: p.name }] : [],
      products: [{
        price: String(p.price),
        currency: 'PKR',
        availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        condition: 'https://schema.org/NewCondition',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imgUrl,
    },
  };
}

/** Generic page metadata */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = `${BASE}${path}`;
  return {
    title: `${title} - Bachat Bazar`,
    description: truncate(description, 160),
    alternates: { canonical: url },
    openGraph: { title: `${title} - Bachat Bazar`, description: truncate(description, 160), url, type: 'website', locale: 'en_PK', siteName: 'Bachat Bazar' },
    twitter: { card: 'summary', title: `${title} - Bachat Bazar`, description: truncate(description, 160) },
  };
}