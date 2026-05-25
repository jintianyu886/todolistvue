export interface ChatSession {
  id: string;
  title: string;
  messages: { role: "user" | "assistant"; content: string }[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "todo-chat-history";

export function getChatHistory(): ChatSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveChatSession(session: ChatSession): void {
  const history = getChatHistory();
  const index = history.findIndex(s => s.id === session.id);
  if (index >= 0) {
    history[index] = session;
  } else {
    history.unshift(session);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
}

export function deleteChatSession(id: string): void {
  const history = getChatHistory().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearChatHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function createNewSession(): ChatSession {
  return {
    id: Date.now().toString(),
    title: "新对话",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function generateTitle(messages: { role: "user" | "assistant"; content: string }[]): string {
  const userMessage = messages.find(m => m.role === "user");
  if (userMessage) {
    return userMessage.content.substring(0, 30) + (userMessage.content.length > 30 ? "..." : "");
  }
  return "新对话";
}