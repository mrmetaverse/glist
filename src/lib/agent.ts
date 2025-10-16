import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { AIMessage, ToolMessage } from "@langchain/core/messages";

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
    return prices.reduce((m, c) => (c.price < m.price ? c : m));
  }
  return null;
}

function makeTools(items: GroceryItem[]) {
  return [
    new DynamicStructuredTool({
      name: "addItem",
      description: "Add a new item to the grocery list",
      schema: z.object({ name: z.string(), quantity: z.number().default(1), unit: z.string().optional(), category: z.string().optional() }),
      func: async (input) => {
        const { name, quantity, unit, category } = input as any;
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
        items.push(newItem);
        return JSON.stringify({ success: true, item: newItem });
      },
    }),
    new DynamicStructuredTool({
      name: "removeItem",
      description: "Remove an item from the grocery list",
      schema: z.object({ name: z.string() }),
      func: async (input) => {
        const { name } = input as any;
        const idx = items.findIndex((i) => i.name.toLowerCase() === name.toLowerCase());
        if (idx !== -1) {
          items.splice(idx, 1);
          return JSON.stringify({ success: true });
        }
        return JSON.stringify({ success: false, message: `Could not find ${name}` });
      },
    }),
    new DynamicStructuredTool({
      name: "markCompleted",
      description: "Mark an item as completed/purchased",
      schema: z.object({ name: z.string() }),
      func: async (input) => {
        const { name } = input as any;
        const it = items.find((i) => i.name.toLowerCase() === name.toLowerCase());
        if (it) {
          it.completed = true;
          return JSON.stringify({ success: true });
        }
        return JSON.stringify({ success: false, message: `Could not find ${name}` });
      },
    }),
    new DynamicStructuredTool({
      name: "getList",
      description: "Get the current grocery list",
      schema: z.object({}),
      func: async () => {
        return JSON.stringify({ items });
      },
    }),
    new DynamicStructuredTool({
      name: "comparePrices",
      description: "Compare prices for an item across different stores",
      schema: z.object({ name: z.string() }),
      func: async (input) => {
        const { name } = input as any;
        const normalized = name.toLowerCase();
        const prices = PRICE_DATA[normalized];
        if (prices) {
          const cheapest = prices.reduce((m, c) => (c.price < m.price ? c : m));
          return JSON.stringify({ success: true, prices, cheapest });
        }
        return JSON.stringify({ success: false, message: `No price data for ${name}` });
      },
    }),
  ];
}

export async function agentExecute(message: string, items: GroceryItem[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2, apiKey });
  const tools = makeTools(items);
  const llm = model.bindTools(tools);

  // Step 1: ask model
  const history: any[] = [
    { role: "system", content: "You are a helpful grocery list assistant. Use tools to modify the list when asked." },
    { role: "user", content: message },
  ];

  let aiMsg = (await llm.invoke(history)) as AIMessage;
  let steps = 0;
  while ((aiMsg?.tool_calls?.length ?? 0) > 0 && steps < 3) {
    steps++;
    const toolOutputs: ToolMessage[] = [];
    for (const call of aiMsg.tool_calls ?? []) {
      const toolName = call.name as string;
      const args = call.args as any;
      const t = tools.find((t) => t.name === toolName);
      if (!t) continue;
      // DynamicStructuredTool has .invoke or .call, use call({ args }) variant
      const result: any = await (t as any).call({ args });
      const content = typeof result === "string" ? result : JSON.stringify(result ?? "");
      toolOutputs.push(new ToolMessage({ content, tool_call_id: call.id ?? "tool" }));
    }
    aiMsg = (await llm.invoke([...history, aiMsg, ...toolOutputs])) as AIMessage;
  }

  const finalText = typeof aiMsg?.content === "string" ? aiMsg.content : Array.isArray(aiMsg?.content) ? aiMsg.content.map((c: any) => c.text ?? "").join(" ") : "";
  return { text: finalText, items };
}
