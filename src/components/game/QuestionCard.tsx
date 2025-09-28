
"use client";

import { useState, useEffect } from "react";
import type { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";

type QuestionCardProps = {
  question: Question;
  onAnswer: (question: Question, answer: string) => void;
  onNextQuestion: () => void;
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
    
    // The backend call
    onAnswer(question, option);
  };

  const getButtonClass = (option: string) => {
    if (feedback === 'idle') return "border-primary/20 hover:bg-primary/10";
    
    const isCorrectAnswer = option.toLowerCase() === question.answer.toLowerCase();
    const isSelectedAnswer = option.toLowerCase() === selectedAnswer?.toLowerCase();

    if (isCorrectAnswer) return "bg-green-500 border-green-600 text-white hover:bg-green-500 animate-pulse";
    if (isSelectedAnswer && !isCorrectAnswer) return "bg-red-500 border-red-600 text-white hover:bg-red-500";

    return "border-gray-300 bg-gray-100 text-gray-400 opacity-60";
  }

  return (
    <Card className={cn("h-full flex flex-col transition-all duration-300 relative")}>
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
      </CardContent>

        {feedback !== 'idle' && (
           <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in duration-300">
             {feedback === 'correct' && (
               <div className="flex flex-col items-center gap-2 text-green-500">
                 <CheckCircle2 className="h-24 w-24" />
                 <p className="text-4xl font-bold font-display">Correct!</p>
               </div>
             )}
             {feedback === 'incorrect' && (
               <div className="flex flex-col items-center gap-2 text-red-500">
                 <XCircle className="h-24 w-24" />
                 <p className="text-4xl font-bold font-display">Incorrect!</p>
                  <p className="text-lg text-muted-foreground">The correct answer was: <span className="font-bold text-foreground">{question.answer}</span></p>
               </div>
             )}
              <Button size="lg" onClick={onNextQuestion} className="mt-8">
                  Next Question <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
           </div>
        )}
    </Card>
  );
}

