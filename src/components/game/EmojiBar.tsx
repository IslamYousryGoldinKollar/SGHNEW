
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmojiBarProps = {
  onSendEmoji: (emoji: string) => void;
};

const emojis = ["😂", "👍", "🤔", "🎉", "🤯", "🔥"];

export default function EmojiBar({ onSendEmoji }: EmojiBarProps) {
  return (
    <Card className="backdrop-blur-sm shadow-lg mt-auto">
      <CardContent className="p-2">
        <div className="grid grid-cols-3 gap-2">
          {emojis.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="icon"
              className="text-2xl"
              onClick={() => onSendEmoji(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
