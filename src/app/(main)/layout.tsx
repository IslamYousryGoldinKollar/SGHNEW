
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import MainLayoutClient from './main-layout-client';
import { cn } from '@/lib/utils';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayoutClient>
      <div className={cn("game-screen")}>
        {children}
      </div>
      <FirebaseErrorListener />
    </MainLayoutClient>
  );
}
