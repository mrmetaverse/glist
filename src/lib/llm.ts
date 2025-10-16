import { ChatOpenAI } from "@langchain/openai";

export function getChat() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.3, apiKey });
}
