
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Shield, LogIn } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "react-firebase-hooks/auth";

export default function LandingPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  
  const isArabicUser = user?.email === 'iyossry@gmail.com';

  const handleJoinSession = async () => {
    if (!pin.trim()) {
      toast({
        title: isArabicUser ? "الرمز مطلوب" : "PIN Required",
        description: isArabicUser ? "الرجاء إدخال رمز PIN للجلسة." : "Please enter a session PIN.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const gameRef = doc(db, "games", pin.trim().toUpperCase());
      const gameDoc = await getDoc(gameRef);

      if (gameDoc.exists()) {
        router.push(`/game/${pin.trim().toUpperCase()}`);
      } else {
        toast({
          title: isArabicUser ? "لم يتم العثور على الجلسة" : "Session Not Found",
          description: isArabicUser ? "الرمز الذي أدخلته غير صحيح." : "The PIN you entered does not match an active session.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error joining session:", error);
      toast({
        title: "Error",
        description: "Could not verify session PIN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-1 flex-col items-center justify-center game-screen" dir={isArabicUser ? 'rtl' : 'ltr'}>
      <div className="text-center mb-12 text-foreground drop-shadow-lg">
        <h1 className="text-5xl font-bold font-display text-slate-700">{isArabicUser ? 'حروب الرعاية' : 'Care Clans'}</h1>
        <p className="text-xl mt-2 text-slate-700">{isArabicUser ? 'تحدي الأسئلة النهائي للفرق' : 'The ultimate team trivia challenge'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="text-accent" />
              {isArabicUser ? 'الانضمام إلى جلسة' : 'Join a Session'}
            </CardTitle>
            <CardDescription>{isArabicUser ? 'أدخل الرمز من الشاشة الكبيرة للانضمام إلى اللعبة.' : 'Enter the PIN from the big screen to join the game.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder={isArabicUser ? 'رمز الجلسة' : 'Session PIN'}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-2xl h-14 text-center tracking-widest font-mono"
              maxLength={6}
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleJoinSession} disabled={isLoading}>
              <LogIn className={isArabicUser ? 'ml-2' : 'mr-2'} />
              {isLoading ? (isArabicUser ? 'جاري الانضمام...' : 'Joining...') : (isArabicUser ? 'انضم للعبة' : 'Join Game')}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-accent" />
              {isArabicUser ? 'وصول المسؤول' : 'Admin Access'}
            </CardTitle>
            <CardDescription>{isArabicUser ? 'إنشاء وإدارة جلسات اللعبة.' : 'Create and manage game sessions.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {isArabicUser ? 'يمكن للمسؤولين إنشاء جلسات جديدة وإدارة الأسئلة والتحكم في اللعبة من لوحة تحكم المسؤول.' : 'Admins can create new sessions, manage questions, and control the game from the admin dashboard.'}
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="secondary" onClick={() => router.push('/admin/login')}>
              {isArabicUser ? 'تسجيل دخول المسؤول' : 'Admin Login'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    