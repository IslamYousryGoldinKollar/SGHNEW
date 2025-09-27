"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type { Game, Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sessionSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters."),
  difficulty: z.enum(["easy", "medium", "hard"]),
  timer: z.coerce.number().min(30, "Timer must be at least 30 seconds."),
  teams: z.array(z.object({
    name: z.string().min(1, "Team name is required."),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
  })).min(1, "At least one team is required."),
  questions: z.array(z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      topic: z.string().min(1),
  })),
});

export default function SessionConfigPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const gameId = params.gameId as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
        topic: 'General Knowledge',
        difficulty: 'medium',
        timer: 300,
        teams: [],
        questions: [],
    }
  });
  
  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({
    control: form.control,
    name: "teams",
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  useEffect(() => {
    if (!gameId) return;
    const gameRef = doc(db, "games", gameId);
    getDoc(gameRef).then((docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() as Game;
        setGame(gameData);
        form.reset({
          topic: gameData.topic,
          difficulty: gameData.difficulty,
          timer: gameData.timer,
          teams: gameData.teams.map(t => ({ name: t.name, capacity: t.capacity })),
          questions: gameData.questions,
        });
      }
      setLoading(false);
    });
  }, [gameId, form]);

  const onSubmit = async (data: z.infer<typeof sessionSchema>) => {
    try {
        const gameRef = doc(db, "games", gameId);
        await updateDoc(gameRef, {
            ...data,
            teams: data.teams.map(t => ({...t, score: 0, players: [] })), // reset score and players on update
        });
        toast({
            title: "Session Updated",
            description: "The game session has been successfully updated.",
        });
        router.push("/admin");
    } catch(error) {
        console.error(error);
        toast({
            title: "Error",
            description: "Failed to update the session.",
            variant: "destructive",
        })
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }
  if (!game) {
    return <div className="flex h-screen items-center justify-center"><h1 className="text-2xl">Game session not found.</h1></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Configure Session: {game.id}</CardTitle>
          <CardDescription>Edit the details for this trivia game session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* General Settings */}
              <Card className="bg-card/50">
                <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="topic" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Topic (for AI Questions)</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="difficulty" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="timer" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Game Timer (seconds)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
              </Card>

              {/* Teams */}
                <Card className="bg-card/50">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Teams</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendTeam({ name: `Team ${teamFields.length + 1}`, capacity: 10 })}>
                                <Plus className="mr-2" /> Add Team
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {teamFields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-center p-4 border rounded-lg">
                                <FormField control={form.control} name={`teams.${index}.name`} render={({ field }) => (
                                    <FormItem className="flex-1"><FormLabel>Team Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name={`teams.${index}.capacity`} render={({ field }) => (
                                     <FormItem><FormLabel>Capacity</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                )} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeTeam(index)}><Trash2 /></Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

              {/* Questions */}
                <Card className="bg-card/50">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Custom Questions</CardTitle>
                             <Button type="button" variant="outline" size="sm" onClick={() => appendQuestion({ question: '', answer: '', difficulty: 'medium', topic: form.getValues('topic') })}>
                                <Plus className="mr-2" /> Add Question
                            </Button>
                        </div>
                        <CardDescription>Add custom questions here. If you leave this empty, questions will be generated by AI based on the topic and difficulty settings above when the game starts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {questionFields.map((field, index) => (
                             <div key={field.id} className="p-4 border rounded-lg space-y-4">
                                <FormField control={form.control} name={`questions.${index}.question`} render={({ field }) => (
                                    <FormItem><FormLabel>Question</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )}/>
                                 <FormField control={form.control} name={`questions.${index}.answer`} render={({ field }) => (
                                    <FormItem><FormLabel>Answer</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )}/>
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField control={form.control} name={`questions.${index}.difficulty`} render={({ field }) => (
                                      <FormItem><FormLabel>Difficulty</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                          <SelectContent>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="hard">Hard</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                  )}/>
                                  <FormField control={form.control} name={`questions.${index}.topic`} render={({ field }) => (
                                      <FormItem><FormLabel>Topic</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                  )}/>
                                </div>
                                <Button type="button" variant="destructive" onClick={() => removeQuestion(index)}>Delete Question</Button>
                            </div>
                        ))}
                         {questionFields.length === 0 && <p className="text-muted-foreground text-sm">No custom questions added. AI will generate them.</p>}
                    </CardContent>
                </Card>

              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
