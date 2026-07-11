import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/faq',
  'FAQ',
  'Frequently asked questions about Bachat Bazar — delivery, returns, payments, orders, and more. Find quick answers to common queries about shopping on Pakistan\'s top marketplace.'
);

export default function FAQPage() {
  return <AppWrapper initialPath="/faq" />;
}