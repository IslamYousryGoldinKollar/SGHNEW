
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
import { cn } from "@/lib/utils";

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
        description: isArabicUser ? "الرجاء إدخال رمز الدخول للتحدي." : "Please enter a session PIN.",
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
          title: isArabicUser ? "التحدي غير موجود" : "Session Not Found",
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
        <h1 className="text-5xl font-bold font-display text-slate-700 font-arabic">{isArabicUser ? 'تحدي قلاع الرعاية' : 'Care Clans'}</h1>
        <p className="text-xl mt-2 text-slate-700 font-arabic">{isArabicUser ? 'التحدي النهائي للفرق الأقوياء' : 'The ultimate team trivia challenge'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="font-arabic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="text-accent" />
              {isArabicUser ? 'أدخل للتحدي' : 'Join a Session'}
            </CardTitle>
            <CardDescription>{isArabicUser ? 'أدخل الرمز من شاشة العرض الرئيسية لبدء اللعب.' : 'Enter the PIN from the big screen to join the game.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder={isArabicUser ? 'رمز التحدي' : 'Session PIN'}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-2xl h-14 text-center tracking-widest font-mono"
              maxLength={6}
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleJoinSession} disabled={isLoading}>
              <LogIn className={isArabicUser ? 'ml-2' : 'mr-2'} />
              {isLoading ? (isArabicUser ? 'جاري الدخول...' : 'Joining...') : (isArabicUser ? 'أدخل للتحدي' : 'Join Game')}
            </Button>
          </CardFooter>
        </Card>

        <Card className="font-arabic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-accent" />
              {isArabicUser ? 'لوحة تحكم المشرف' : 'Admin Access'}
            </CardTitle>
            <CardDescription>{isArabicUser ? 'لإنشاء وإدارة التحديات والألعاب.' : 'Create and manage game sessions.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {isArabicUser ? 'يمكن للمشرفين إنشاء تحديات جديدة، إدارة الأسئلة، والتحكم في سير اللعبة من لوحة التحكم.' : 'Admins can create new sessions, manage questions, and control the game from the admin dashboard.'}
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="secondary" onClick={() => router.push('/admin/login')}>
              {isArabicUser ? 'دخول المشرف' : 'Admin Login'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    