import type { Todo, TodoInput } from "@/types/todo";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}

export function fetchTodos(): Promise<Todo[]> {
  return request<Todo[]>("/api/todos");
}

export function createTodo(input: TodoInput): Promise<Todo> {
  return request<Todo>("/api/todos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTodoApi(
  id: string,
  updates: Partial<Pick<Todo, "title" | "completed" | "priority" | "dueDate">>,
): Promise<Todo> {
  return request<Todo>(`/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteTodoApi(id: string): Promise<void> {
  return request<void>(`/api/todos/${id}`, { method: "DELETE" });
}

export function clearCompletedApi(): Promise<{ removed: number }> {
  return request<{ removed: number }>("/api/todos/completed", {
    method: "DELETE",
  });
}

export { API_BASE };
