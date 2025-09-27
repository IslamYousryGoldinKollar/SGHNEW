
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

  useEffect(() => {
    // For admin pages, we can remove the theme or set a default admin theme
    document.documentElement.removeAttribute('data-theme');
  }, [pathname]);

  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </>
  );
}
