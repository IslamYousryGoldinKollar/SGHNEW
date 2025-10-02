
import { Suspense } from 'react';
import LoginForm from './login-form';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
      <Suspense fallback={<Loader2 className="h-16 w-16 animate-spin" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
