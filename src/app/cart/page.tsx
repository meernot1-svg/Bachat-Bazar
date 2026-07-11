import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/cart',
  'Shopping Cart',
  'Review your shopping cart at Bachat Bazar. Add or remove items, apply coupon codes, and proceed to checkout for fast delivery across Pakistan.'
);

export default function CartPage() {
  return <AppWrapper initialPath="/cart" />;
}