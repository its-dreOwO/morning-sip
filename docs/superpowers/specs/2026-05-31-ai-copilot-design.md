# AI Copilot & Summarizer Spec

**Date:** 2026-05-31
**Status:** Approved

## 1. Purpose
Introduce a personal morning dashboard AI Copilot. It consists of:
1. An **inline glassmorphic briefing card** next to the greeting that displays a warm, highly concise (2-3 sentences) daily summary generated from the data currently displayed in all widgets.
2. A **slide-out chat sidebar/drawer** that opens when the user clicks or types in the card's chat input. The user can converse with the AI, asking details about the widget data (e.g. "Which email is important?" or "What tasks do I have left?").
3. A **setup view** embedded in the briefing card when the OpenRouter API key is missing, storing it directly in the browser's `localStorage` (`dashboard.openrouter_api_key`).

## 2. Scope
- Centralize all active widget data into a React context provider (`DashboardDataContext`).
- Render the briefing summary card in the app header (next to the greeting).
- Render a sidebar chat drawer that slides in from the right edge of the screen using Framer Motion.
- Connect to OpenRouter API using model `deepseek/deepseek-v4-flash`.
- Authenticate requests client-side using the user-provided API key from `localStorage`.
- Maintain chat message history (stateful within the session) for follow-up questions.

## 3. Architecture & Components

```
src/
  context/
    DashboardDataContext.tsx     Shared context collecting all widget states/data
  components/
    AiBriefingCard.tsx           Header card displaying summary & API key setup
    CopilotSidebar.tsx           Right-drawer slide-out chat interface
  App.tsx                        Wraps with DashboardDataProvider; renders Card & Sidebar
  components/
    WidgetHost.tsx               Updates DashboardDataContext on change/render
```

### 3.1. DashboardDataContext
A context provider that exposes:
```typescript
interface WidgetDataState {
  id: string;
  name: string;
  state: "loading" | "ready" | "empty" | "error";
  data: any;
}

interface DashboardDataContextType {
  widgetsData: Record<string, WidgetDataState>;
  updateWidgetData: (id: string, name: string, state: WidgetDataState["state"], data: any) => void;
}
```

### 3.2. WidgetHost Integration
`WidgetHost` calls `updateWidgetData` inside a `useEffect` whenever its widget's hook results change, ensuring the context is always up-to-date with what is physically visible.

### 3.3. AiBriefingCard
- Placed in the `<header>` element of `App.tsx` next to the greeting.
- Displays a skeleton loader during briefing generation.
- Displays a clean text field to input the OpenRouter key if not present.
- Displays a chat input box that opens the `CopilotSidebar` on focus/click.

### 3.4. CopilotSidebar
- Handles the slide-out transition from the right (`x: "100%"` to `x: 0`) using Framer Motion's `AnimatePresence`.
- Shows chat history between User and Assistant.
- Fetches replies from OpenRouter endpoint: `https://openrouter.ai/api/v1/chat/completions`.
- Formats requests using model `deepseek/deepseek-v4-flash`.

## 4. OpenRouter API Integration
- **Headers:**
  - `Authorization: Bearer <user_api_key>`
  - `Content-Type: application/json`
  - `HTTP-Referer: http://localhost:5173` (optional, for OpenRouter tracking)
  - `X-Title: Morning Dashboard`
- **Request Body:**
  ```json
  {
    "model": "deepseek/deepseek-v4-flash",
    "messages": [
      { "role": "system", "content": "... system prompt with dashboard data JSON ..." },
      ...chatHistory...
    ]
  }
  ```

### 4.1. System Prompt Construction
The system prompt injects all active widget data in a compact JSON format:
```
You are the user's personal morning AI assistant. You are helping them analyze their dashboard.
Here is the current real-time data displayed on their dashboard widgets:
[Widget Data JSON]

Provide helpful, context-aware answers based strictly on this data. If data is loading or empty, mention it politely. Keep answers brief and conversational.
```

## 5. UI & Styling (Mocha Theme)
- Inline Card uses the existing glassmorphic styling: `bg-card-surface border border-white/10 backdrop-blur`.
- Sidebar uses a darker mocha container: `bg-bg-deep border-l border-white/10 w-96 max-w-full z-50 shadow-2xl`.
- Subtle animations (hover lifts, fade-ins, slide-ins) matching existing framer-motion transitions.

## 6. Testing Strategy
- Unit test `DashboardDataContext` to verify updates merge correctly.
- Test `AiBriefingCard` renders the key input field when key is absent, and the briefing text when present.
- Mock the fetch calls to `openrouter.ai` to test loading, success, and error UI flows in `CopilotSidebar`.
