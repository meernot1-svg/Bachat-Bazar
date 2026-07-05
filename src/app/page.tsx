'use client';

import dynamic from 'next/dynamic';

const BachatBazarApp = dynamic(
  () => import('@/components/bachat/BachatBazarApp'),
  { ssr: false, loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#006233] to-[#00A651] flex items-center justify-center text-white font-bold text-2xl shadow-lg">B</div>
        <h1 className="text-xl font-bold text-[#006233]">Bachat Bazar</h1>
        <p className="text-sm text-gray-500 mt-1">Pakistan&apos;s #1 Online Marketplace</p>
        <div className="mt-4 w-8 h-8 mx-auto border-3 border-[#006233] border-t-transparent rounded-full animate-spin"/>
      </div>
    </div>
  )}
);

export default function Home() {
  return <BachatBazarApp />;
}
