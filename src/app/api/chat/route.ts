import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getChat } from "@/lib/llm";

type GroceryItem = {
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

const PRICE_DATA: Record<string, { price: number; store: string }[]> = {
  milk: [
    { price: 3.99, store: "Walmart" },
    { price: 4.29, store: "Target" },
    { price: 3.79, store: "Kroger" },
  ],
  bread: [
    { price: 2.49, store: "Walmart" },
    { price: 2.99, store: "Target" },
    { price: 2.29, store: "Kroger" },
  ],
  eggs: [
    { price: 3.49, store: "Walmart" },
    { price: 3.99, store: "Target" },
    { price: 3.29, store: "Kroger" },
  ],
  chicken: [
    { price: 8.99, store: "Walmart" },
    { price: 9.49, store: "Target" },
    { price: 8.49, store: "Kroger" },
  ],
  apples: [
    { price: 4.99, store: "Walmart" },
    { price: 5.49, store: "Target" },
    { price: 4.79, store: "Kroger" },
  ],
};

function getPriceEstimate(itemName: string): { price: number; store: string } | null {
  const normalized = itemName.toLowerCase();
  const prices = PRICE_DATA[normalized];
  if (prices && prices.length > 0) {
    return prices.reduce((min, current) => (current.price < min.price ? current : min));
  }
  return null;
}

export async function POST(req: Request) {
  const { message, items } = await req.json();
  const currentItems: GroceryItem[] = items || [];
  try {
    const chat = getChat();
    if (chat) {
      // Minimal LC call for natural language response (tools not wired in LC here for brevity)
      const lcRes = await chat.invoke([
        { role: "system", content: "You are a helpful grocery list assistant." },
        { role: "user", content: message },
      ] as any);

      return Response.json({ response: lcRes?.content?.toString?.() ?? "", items: currentItems });
    }

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a helpful grocery list assistant. You help users manage their shopping list through natural conversation.\n\nYou can:\n- Add items to their list with quantities and units\n- Remove items from their list\n- Mark items as completed\n- Answer questions about their list\n- Compare prices across stores\n- Suggest categories for items\n- Provide helpful shopping tips\n\nBe conversational, friendly, and concise. When users ask about their list, describe it naturally.\nWhen adding items, try to infer reasonable quantities if not specified.",
      prompt: message,
      tools: {
        addItem: tool({
          description: "Add a new item to the grocery list",
          parameters: z.object({
            name: z.string().describe("The name of the item"),
            quantity: z.number().default(1).describe("The quantity needed"),
            unit: z.string().optional().describe("The unit of measurement (e.g., lbs, oz, dozen)"),
            category: z.string().optional().describe("The category (e.g., dairy, produce, meat)"),
          }),
          execute: async ({ name, quantity, unit, category }) => {
            const priceInfo = getPriceEstimate(name);
            const newItem: GroceryItem = {
              id: Date.now().toString(),
              name,
              quantity,
              unit,
              category,
              priceEstimate: priceInfo?.price,
              store: priceInfo?.store,
              completed: false,
              addedAt: new Date(),
            };
            currentItems.push(newItem);
            return { success: true, item: newItem };
          },
        }),
        removeItem: tool({
          description: "Remove an item from the grocery list",
          parameters: z.object({
            name: z.string().describe("The name of the item to remove"),
          }),
          execute: async ({ name }) => {
            const index = currentItems.findIndex((item) => item.name.toLowerCase() === name.toLowerCase());
            if (index !== -1) {
              currentItems.splice(index, 1);
              return { success: true, message: `Removed ${name} from your list` };
            }
            return { success: false, message: `Could not find ${name} in your list` };
          },
        }),
        markCompleted: tool({
          description: "Mark an item as completed/purchased",
          parameters: z.object({
            name: z.string().describe("The name of the item to mark as completed"),
          }),
          execute: async ({ name }) => {
            const item = currentItems.find((item) => item.name.toLowerCase() === name.toLowerCase());
            if (item) {
              item.completed = true;
              return { success: true, message: `Marked ${name} as completed` };
            }
            return { success: false, message: `Could not find ${name} in your list` };
          },
        }),
        getList: tool({
          description: "Get the current grocery list",
          parameters: z.object({}),
          execute: async () => {
            return { items: currentItems };
          },
        }),
        comparePrices: tool({
          description: "Compare prices for an item across different stores",
          parameters: z.object({
            name: z.string().describe("The name of the item to compare prices for"),
          }),
          execute: async ({ name }) => {
            const normalized = name.toLowerCase();
            const prices = PRICE_DATA[normalized];
            if (prices) {
              return {
                success: true,
                prices,
                cheapest: prices.reduce((min, current) => (current.price < min.price ? current : min)),
              };
            }
            return {
              success: false,
              message: `Sorry, I don't have price data for ${name} yet.`,
            };
          },
        }),
      },
      maxSteps: 5,
    });

    return Response.json({ response: result.text, items: currentItems });
  } catch (error) {
    console.error("[v0] Error in chat API:", error);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
