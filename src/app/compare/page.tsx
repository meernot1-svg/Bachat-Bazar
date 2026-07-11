import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/compare',
  'Compare Products',
  'Compare products side by side at Bachat Bazar. Check prices, features, specifications, and reviews to make the best buying decision.'
);

export default function ComparePage() {
  return <AppWrapper initialPath="/compare" />;
}