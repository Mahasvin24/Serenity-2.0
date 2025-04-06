"use client";

import { Bot, Copy, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [_, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-3xl p-4 ",
        message.role === "assistant" ? "bg-black/60" : ""
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
          message.role === "assistant"
            ? "bg-black text-primary"
            : "bg-black"
        )}
      >
        {message.role === "assistant" ? (
          <Bot className="h-5 w-5 bg-black text-white rounded-full p-[0.8px]" />
        ) : (
          <User className="h-5 w-5 bg-black" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p>{message.content}</p>
        </div>
        {message.role === "assistant" && (
          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={copyToClipboard}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                feedback === "like"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : ""
              )}
              onClick={() => setFeedback(feedback === "like" ? null : "like")}
              title="Like"
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="sr-only">Like</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                feedback === "dislike"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : ""
              )}
              onClick={() =>
                setFeedback(feedback === "dislike" ? null : "dislike")
              }
              title="Dislike"
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="sr-only">Dislike</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
