<script setup lang="ts">
import { computed } from "vue";
import { filterTodos, sortTodos } from "@/lib/todo-utils";
import type { Filter, Todo } from "@/types/todo";
import TodoItem from "./TodoItem.vue";

const props = defineProps<{
  todos: Todo[];
  filter: Filter;
  onToggle: (id: string) => void;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Todo, "title" | "priority" | "dueDate">>,
  ) => void;
  onDelete: (id: string) => void;
}>();

const emptyMessages: Record<Filter, string> = {
  all: "还没有任务，添加一条开始吧",
  active: "没有进行中的任务",
  completed: "还没有已完成的任务",
};

const visible = computed(() =>
  sortTodos(filterTodos(props.todos, props.filter)),
);
</script>

<template>
  <div
    v-if="visible.length === 0"
    class="rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700"
  >
    <p class="text-sm text-zinc-500 dark:text-zinc-400">
      {{ emptyMessages[filter] }}
    </p>
  </div>
  <ul v-else class="space-y-2">
    <TodoItem
      v-for="todo in visible"
      :key="todo.id"
      :todo="todo"
      :on-toggle="onToggle"
      :on-update="onUpdate"
      :on-delete="onDelete"
    />
  </ul>
</template>
