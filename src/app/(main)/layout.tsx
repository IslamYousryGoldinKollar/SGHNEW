
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import MainLayoutClient from './main-layout-client';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayoutClient>
      {children}
      <FirebaseErrorListener />
    </MainLayoutClient>
  );
}
