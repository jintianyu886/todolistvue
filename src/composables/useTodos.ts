import { computed, onMounted, ref } from "vue";
import {
  checkApiHealth,
  clearCompletedApi,
  createTodo,
  deleteTodoApi,
  fetchTodos,
  updateTodoApi,
} from "@/lib/api";
import type { Todo, TodoInput } from "@/types/todo";

export function useTodos() {
  const todos = ref<Todo[]>([]);
  const hydrated = ref(false);
  const apiOnline = ref(false);
  const error = ref<string | null>(null);

  const stats = computed(() => ({
    total: todos.value.length,
    active: todos.value.filter((t) => !t.completed).length,
    completed: todos.value.filter((t) => t.completed).length,
  }));

  async function refresh() {
    const online = await checkApiHealth();
    apiOnline.value = online;
    if (!online) {
      error.value = "无法连接后端 API，请先启动 demo-backend（端口 4000）";
      todos.value = [];
      return;
    }
    error.value = null;
    todos.value = await fetchTodos();
  }

  onMounted(() => {
    refresh()
      .catch(() => {
        error.value = "加载待办失败";
      })
      .finally(() => {
        hydrated.value = true;
      });
  });

  async function addTodo(input: TodoInput): Promise<boolean> {
    const title = input.title.trim();
    if (!title) return false;
    try {
      const todo = await createTodo({ ...input, title });
      todos.value = [todo, ...todos.value];
      error.value = null;
      return true;
    } catch {
      error.value = "添加失败";
      return false;
    }
  }

  async function toggleTodo(id: string) {
    const current = todos.value.find((t) => t.id === id);
    if (!current) return;
    try {
      const updated = await updateTodoApi(id, {
        completed: !current.completed,
      });
      todos.value = todos.value.map((t) => (t.id === id ? updated : t));
      error.value = null;
    } catch {
      error.value = "更新失败";
    }
  }

  async function updateTodo(
    id: string,
    updates: Partial<Pick<Todo, "title" | "priority" | "dueDate">>,
  ) {
    try {
      const updated = await updateTodoApi(id, updates);
      todos.value = todos.value.map((t) => (t.id === id ? updated : t));
      error.value = null;
    } catch {
      error.value = "保存失败";
    }
  }

  async function deleteTodo(id: string) {
    try {
      await deleteTodoApi(id);
      todos.value = todos.value.filter((t) => t.id !== id);
      error.value = null;
    } catch {
      error.value = "删除失败";
    }
  }

  async function clearCompleted() {
    try {
      await clearCompletedApi();
      todos.value = todos.value.filter((t) => !t.completed);
      error.value = null;
    } catch {
      error.value = "清除失败";
    }
  }

  return {
    todos,
    hydrated,
    apiOnline,
    error,
    stats,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
  };
}
