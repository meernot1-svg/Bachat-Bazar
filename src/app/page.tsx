import { homeMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = homeMetadata();

export default function HomePage() {
  return <AppWrapper initialPath="/" />;
}