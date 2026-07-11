import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/new',
  'New Arrivals',
  'Discover the latest new arrivals at Bachat Bazar. Shop the newest products in electronics, fashion, beauty, home and more — fresh stock added daily.'
);

export default function NewPage() {
  return <AppWrapper initialPath="/new" />;
}