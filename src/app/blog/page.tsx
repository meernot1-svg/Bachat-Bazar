import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/blog',
  'Blog',
  'Read the latest articles, buying guides, and tips on shopping, lifestyle, and savings at Bachat Bazar. Stay informed with expert product reviews and Pakistani market insights.'
);

export default function BlogPage() {
  return <AppWrapper initialPath="/blog" />;
}