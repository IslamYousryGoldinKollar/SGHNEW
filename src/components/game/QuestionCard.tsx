
"use client";

import { useState, useEffect } from "react";
import type { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

type QuestionPhase = 'answering' | 'feedback' | 'coloring' | 'transitioning';

type QuestionCardProps = {
  question: Question;
  questionPhase: QuestionPhase;
  lastAnswerCorrect: boolean | null;
  onAnswer: (question: Question, answer: string) => void;
  className?: string;
  isIndividualMode: boolean;
  language?: 'en' | 'ar';
};

export default function QuestionCard({
  question,
  questionPhase,
  lastAnswerCorrect,
  onAnswer,
  className,
  isIndividualMode,
  language = 'en'
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const isRTL = language === 'ar';
  
  // Resolve localized content
  const displayQuestion = (language === 'ar' && question.questionAr) ? question.questionAr : question.question;
  const displayOptions = (language === 'ar' && question.optionsAr) ? question.optionsAr : question.options;
  const displayAnswer = (language === 'ar' && question.answerAr) ? question.answerAr : question.answer;

  useEffect(() => {
    // Reset selected answer when the question changes (signified by phase resetting to 'answering')
    if (questionPhase === 'answering') {
      setSelectedAnswer(null);
    }
  }, [question, questionPhase]);

  const handleAnswerClick = (option: string) => {
    if (questionPhase !== 'answering') return;
    setSelectedAnswer(option);
    onAnswer(question, option);
  };
  
  // Helper to determine correctness based on displayed language
  const checkIsCorrect = (option: string) => {
      return option.trim().toLowerCase() === displayAnswer.trim().toLowerCase();
  };

  const getButtonClass = (option: string) => {
    if (questionPhase === 'answering') {
      return "border-primary/20 hover:border-primary hover:bg-primary/5";
    }
    const isCorrectAnswer = checkIsCorrect(option);
    const isSelectedAnswer = option.trim().toLowerCase() === selectedAnswer?.trim().toLowerCase();

    if (isCorrectAnswer) return "bg-green-500 border-green-600 text-white";
    if (isSelectedAnswer && !isCorrectAnswer) return "bg-red-500 border-red-600 text-white";
    
    return "border-gray-300 bg-gray-100 text-gray-400 opacity-60";
  };

  const showFeedbackOverlay = questionPhase === 'feedback' || questionPhase === 'transitioning';

  return (
    <Card className={cn("h-full relative overflow-hidden flex flex-col", className)} dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className={cn("text-xl md:text-2xl font-display leading-tight text-center", isRTL && "font-arabic")}>
            {displayQuestion}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayOptions?.map((option, index) => (
            <Button
              key={`${displayQuestion}-${index}`}
              variant="outline"
              size="lg"
              className={cn(
                "h-auto min-h-14 py-3 text-base md:text-lg justify-start text-left whitespace-normal", 
                getButtonClass(option),
                isRTL && "text-right flex-row-reverse"
              )}
              onClick={() => handleAnswerClick(option)}
              disabled={questionPhase !== 'answering'}
            >
              <span className={cn("font-bold", isRTL ? "ml-3" : "mr-3")}>
                {isRTL ? String.fromCharCode(1575 + index) : String.fromCharCode(65 + index)}.
              </span>
              <span className="flex-1">{option}</span>
            </Button>
          ))}
        </div>
      </CardContent>

      {showFeedbackOverlay && lastAnswerCorrect !== null && (
        <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300 z-50">
          {lastAnswerCorrect ? (
             <>
               <CheckCircle2 className="h-16 w-16 md:h-20 md:w-20 text-green-500 mb-4" />
               <p className={cn("text-2xl md:text-4xl font-bold text-green-600", isRTL && "font-arabic")}>
                   {isRTL ? "إجابة صحيحة!" : "Correct!"}
               </p>
             </>
          ) : (
             <>
               <XCircle className="h-16 w-16 md:h-20 md:w-20 text-red-500 mb-4" />
               <p className={cn("text-2xl md:text-4xl font-bold text-red-600", isRTL && "font-arabic")}>
                   {isRTL ? "إجابة خاطئة!" : "Incorrect!"}
               </p>
               {isIndividualMode && (
                <p className="mt-2 text-muted-foreground text-sm md:text-base">
                    {isRTL ? "الإجابة: " : "Answer: "} {displayAnswer}
                </p>
               )}
             </>
          )}
        </div>
      )}
    </Card>
  );
}
