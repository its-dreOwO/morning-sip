import type { WidgetDataState } from "../context/DashboardDataContext";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type WidgetsSnapshot = Record<string, WidgetDataState | unknown>;

const MODEL = "deepseek/deepseek-v4-flash";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export async function callOpenRouter(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "Morning Dashboard",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText} (${response.status})`);
  }

  const result = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error("Invalid response format from OpenRouter");
  return content;
}

function dashboardContext(widgetsData: WidgetsSnapshot): string {
  return `Here is the current real-time data displayed on their dashboard widgets:
${JSON.stringify(widgetsData, null, 2)}`;
}

export async function fetchLUMIXBriefing(apiKey: string, widgetsData: WidgetsSnapshot): Promise<string> {
  const systemPrompt = `You are LUMIX, the user's personal morning AI assistant helping them read their dashboard.
${dashboardContext(widgetsData)}

Provide a warm, super-concise daily briefing (2-3 sentences max). Highlight critical items like weather warnings, calendar events, or system alerts.`;
  return callOpenRouter(apiKey, [{ role: "system", content: systemPrompt }]);
}

export async function askLUMIX(
  apiKey: string,
  widgetsData: WidgetsSnapshot,
  chatHistory: ChatMessage[]
): Promise<string> {
  const systemPrompt = `You are LUMIX, the user's personal morning AI assistant helping them read their dashboard.
${dashboardContext(widgetsData)}

Provide helpful, context-aware answers based on this data. If the user asks something outside the dashboard context, reply politely and bring the focus back. Keep answers brief and conversational.`;
  return callOpenRouter(apiKey, [{ role: "system", content: systemPrompt }, ...chatHistory]);
}
