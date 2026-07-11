import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/checkout',
  'Checkout',
  'Complete your purchase at Bachat Bazar. Choose your delivery address, payment method (COD, card, bank transfer), and place your order with secure checkout.'
);

export default function CheckoutPage() {
  return <AppWrapper initialPath="/checkout" />;
}