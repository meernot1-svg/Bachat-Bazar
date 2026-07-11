import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/account',
  'My Account',
  'Manage your Bachat Bazar account — update profile, view addresses, track orders, and manage payment methods for a seamless shopping experience.'
);

export default function AccountPage() {
  return <AppWrapper initialPath="/account" />;
}