import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/orders',
  'My Orders',
  'Track and manage your orders at Bachat Bazar. View order history, check delivery status, and download invoices for all your Pakistani marketplace purchases.'
);

export default function OrdersPage() {
  return <AppWrapper initialPath="/orders" />;
}