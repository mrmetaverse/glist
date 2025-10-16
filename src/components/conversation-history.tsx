"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Bot } from "lucide-react";
import type { Message } from "@/app/page";

type ConversationHistoryProps = {
  messages: Message[];
};

export function ConversationHistory({ messages }: ConversationHistoryProps) {
  if (messages.length === 0) return null;
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Conversation</h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
