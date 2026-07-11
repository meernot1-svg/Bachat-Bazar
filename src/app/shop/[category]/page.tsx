import { shopMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  return shopMetadata({ category });
}

export async function generateStaticParams() {
  const { CATEGORIES } = await import('@/lib/data');
  return CATEGORIES.map(c => ({ category: c.id }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  return <AppWrapper initialPath={`/shop?category=${category}`} />;
}