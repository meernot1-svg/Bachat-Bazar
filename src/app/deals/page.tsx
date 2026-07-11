import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/deals',
  'Deals & Offers',
  'Browse the best deals and discount offers at Bachat Bazar. Save big on electronics, beauty, fashion, home appliances and more with exclusive Pakistani deals.'
);

export default function DealsPage() {
  return <AppWrapper initialPath="/deals" />;
}