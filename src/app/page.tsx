"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Loader2, Send } from "lucide-react";
import { GroceryList } from "@/components/grocery-list";
import { ConversationHistory } from "@/components/conversation-history";
import { useToast } from "@/hooks/use-toast";

export type GroceryItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
  priceEstimate?: number;
  store?: string;
  completed: boolean;
  addedAt: Date;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function Home() {
  const [items, setItems] = useState<GroceryItem[]>([
    { id: "1", name: "Milk", quantity: 2, unit: "gallons", category: "Dairy", completed: false, addedAt: new Date() },
    { id: "2", name: "Oat Milk", quantity: 1, unit: "carton", category: "Dairy", completed: false, addedAt: new Date() },
    { id: "3", name: "Cheddar Cheese", quantity: 1, unit: "block", category: "Dairy", completed: false, addedAt: new Date() },
    { id: "4", name: "Apples", quantity: 6, category: "Produce", completed: false, addedAt: new Date() },
    { id: "5", name: "Bananas", quantity: 1, unit: "bunch", category: "Produce", completed: false, addedAt: new Date() },
    { id: "6", name: "Spinach", quantity: 2, unit: "bags", category: "Produce", completed: false, addedAt: new Date() },
    { id: "7", name: "Chicken Breast", quantity: 2, unit: "lbs", category: "Meat", completed: false, addedAt: new Date() },
    { id: "8", name: "Ground Beef", quantity: 1, unit: "lb", category: "Meat", completed: false, addedAt: new Date() },
    { id: "9", name: "Bread", quantity: 1, unit: "loaf", category: "Bakery", completed: false, addedAt: new Date() },
    { id: "10", name: "Pasta", quantity: 2, unit: "boxes", category: "Pantry", completed: false, addedAt: new Date() },
    { id: "11", name: "Olive Oil", quantity: 1, unit: "bottle", category: "Pantry", completed: false, addedAt: new Date() },
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast?.() ?? { toast: () => {} } as any;

  useEffect(() => {
    const stored = localStorage.getItem("groceryItems");
    if (stored) {
      const parsed = JSON.parse(stored);
      setItems(parsed.map((item: any) => ({ ...item, addedAt: new Date(item.addedAt) })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("groceryItems", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        handleVoiceInput(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast?.({
          title: "Voice input error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast?.({ title: "Not supported", description: "Voice input is not supported in your browser.", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleInput = async (text: string) => {
    setIsProcessing(true);
    setMessages((prev) => [...prev, { role: "user", content: text, timestamp: new Date() }]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, items }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response, timestamp: new Date() }]);
      if (data.items) setItems(data.items);
      if (typeof window !== "undefined" && (window as any).speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        (window as any).speechSynthesis.speak(utterance);
      }
    } catch (err) {
      toast?.({ title: "Processing error", description: "Could not process your request.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = async (text: string) => handleInput(text);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    const text = textInput.trim();
    setTextInput("");
    await handleInput(text);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Voice Grocery List</h1>
          <p className="text-muted-foreground text-lg">Speak naturally to manage your shopping list</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <GroceryList items={items} setItems={setItems} />
          </div>
          <div>
            <ConversationHistory messages={messages} />
          </div>
        </div>

        <div className="mt-6 max-w-2xl mx-auto space-y-4">
          <Card className="p-4">
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your message here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isProcessing}
                className="flex-1"
              />
              <Button type="submit" disabled={isProcessing || !textInput.trim()} size="icon">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                onClick={toggleListening}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full transition-all ${
                  isListening ? "bg-destructive hover:bg-destructive/90 animate-pulse" : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {isListening ? "Listening..." : isProcessing ? "Processing..." : "Tap to speak"}
                </p>
                {transcript && <p className="text-sm text-foreground italic">"{transcript}"</p>}
              </div>

              <div className="w-full pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Try saying: "Add milk to my list" or "What's on my list?" or "Remove bread"
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
