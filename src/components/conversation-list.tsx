"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
};

interface ConversationListProps {
  conversations: Conversation[];
  currentId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  currentId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto text-white">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={cn(
            "group flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-300 ease-in-out hover:bg-gray-900",
            conversation.id === currentId ? "bg-gray-900" : ""
          )}
        >
          <button
            className="flex flex-1 items-center gap-3 overflow-hidden text-left"
            onClick={() => onSelect(conversation.id)}
          >
            <MessageSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 truncate">
              <div className="truncate font-medium">{conversation.title}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(conversation.createdAt, {
                  addSuffix: true,
                })}
              </div>
            </div>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conversation.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
