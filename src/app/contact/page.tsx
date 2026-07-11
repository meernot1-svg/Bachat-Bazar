import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/contact',
  'Contact Us',
  'Get in touch with Bachat Bazar customer support. Reach us by phone, email, or visit our office in Lahore. We are here to help with orders, returns, and inquiries.'
);

export default function ContactPage() {
  return <AppWrapper initialPath="/contact" />;
}