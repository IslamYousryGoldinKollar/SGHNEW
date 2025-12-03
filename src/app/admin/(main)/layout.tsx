
'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useEffect } from 'react';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </>
  );
}
