import { shopMetadata, pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = shopMetadata();

export default function ShopPage() {
  return <AppWrapper initialPath="/shop" />;
}