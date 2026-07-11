import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/about',
  'About Us',
  'Learn about Bachat Bazar — Pakistan\'s fastest-growing online marketplace. Our mission is to bring the best products at the most competitive prices with fast delivery across Pakistan.'
);

export default function AboutPage() {
  return <AppWrapper initialPath="/about" />;
}