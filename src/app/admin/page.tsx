import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/admin',
  'Admin Panel',
  'Bachat Bazar administration panel for managing products, orders, and store settings.'
);

export default function AdminPage() {
  return <AppWrapper initialPath="/admin" />;
}