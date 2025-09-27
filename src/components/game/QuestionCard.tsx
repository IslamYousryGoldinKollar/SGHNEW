
"use client";

import { useState, useEffect } from "react";
import type { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Lightbulb, Loader2 } from "lucide-react";

type QuestionCardProps = {
  question: Question;
  onAnswer: (question: Question, answer: string) => void;
  onNextQuestion: () => void; // This is called after the feedback timeout
};

export default function QuestionCard({ question, onAnswer, onNextQuestion }: QuestionCardProps) {
  const [feedback, setFeedback] = useState<"idle" | "correct" | "incorrect">("idle");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when a new question comes in
  useEffect(() => {
    setFeedback("idle");
    setSelectedAnswer(null);
    setIsSubmitting(false);
  }, [question]);

  const handleAnswerClick = (option: string) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSelectedAnswer(option);

    const isCorrect = question.answer.trim().toLowerCase() === option.trim().toLowerCase();
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    // Simulate network latency for onAnswer and then move to the next question
    setTimeout(() => {
      onAnswer(question, option);
      // The parent component (`GamePage`) will now provide a new question,
      // which will trigger the useEffect hook above to reset the card.
    }, 1200); // Wait for feedback animation
  };

  const getButtonClass = (option: string) => {
    if (feedback === 'idle') return "border-primary/20 hover:bg-primary/10";
    
    const isCorrectAnswer = option.toLowerCase() === question.answer.toLowerCase();
    const isSelectedAnswer = option.toLowerCase() === selectedAnswer?.toLowerCase();

    if (isCorrectAnswer) return "bg-green-500/20 border-green-500 hover:bg-green-500/30 animate-pulse";
    if (isSelectedAnswer && !isCorrectAnswer) return "bg-red-500/20 border-red-500 hover:bg-red-500/30";

    return "border-primary/20 opacity-50";
  }

  return (
    <Card className={cn("h-full flex flex-col transition-all duration-300 bg-card/50")}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl lg:text-3xl font-display">{question.question}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              size="lg"
              className={cn("h-auto min-h-[60px] py-4 text-lg whitespace-normal justify-start text-left", getButtonClass(option))}
              onClick={() => handleAnswerClick(option)}
              disabled={feedback !== 'idle'}
            >
              <span className="mr-4 font-bold">{String.fromCharCode(65 + index)}:</span>
              {option}
            </Button>
          ))}
        </div>
        
        {feedback !== 'idle' && (
           <div className="text-center mt-6 space-y-4 animate-in fade-in duration-500">
             {feedback === 'correct' && (
               <div className="flex justify-center items-center gap-2 text-green-400">
                 <CheckCircle2 className="h-8 w-8" />
                 <p className="text-2xl font-bold">Correct!</p>
               </div>
             )}
             {feedback === 'incorrect' && (
               <div className="flex flex-col items-center gap-2 text-red-400">
                 <XCircle className="h-8 w-8" />
                 <p className="text-2xl font-bold">Incorrect!</p>
                 <p className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5"/> The correct answer was: <strong className="text-foreground">{question.answer}</strong></p>
               </div>
             )}
              <div className="flex justify-center items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin"/>
                <span>Loading next question...</span>
              </div>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
