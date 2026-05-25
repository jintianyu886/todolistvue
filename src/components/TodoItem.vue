<script setup lang="ts">
import { ref } from "vue";
import { formatDate, isDueToday, isOverdue } from "@/lib/todo-utils";
import type { Priority, Todo } from "@/types/todo";

const props = defineProps<{
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Todo, "title" | "priority" | "dueDate">>,
  ) => void;
  onDelete: (id: string) => void;
}>();

const editing = ref(false);
const editTitle = ref(props.todo.title);

const priorityStyles: Record<
  Priority,
  { badge: string; dot: string; label: string }
> = {
  high: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    dot: "bg-rose-500",
    label: "高",
  },
  medium: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    dot: "bg-amber-500",
    label: "中",
  },
  low: {
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    dot: "bg-sky-500",
    label: "低",
  },
};

function saveEdit() {
  const trimmed = editTitle.value.trim();
  if (trimmed && trimmed !== props.todo.title) {
    props.onUpdate(props.todo.id, { title: trimmed });
  } else {
    editTitle.value = props.todo.title;
  }
  editing.value = false;
}

function startEdit() {
  editTitle.value = props.todo.title;
  editing.value = true;
}

function cancelEdit() {
  editTitle.value = props.todo.title;
  editing.value = false;
}
</script>

<template>
  <li
    class="group flex items-start gap-3 rounded-xl border px-4 py-3 transition"
    :class="
      todo.completed
        ? 'border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/50'
        : 'border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50'
    "
  >
    <button
      type="button"
      class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
      :class="
        todo.completed
          ? 'border-indigo-500 bg-indigo-500 text-white'
          : 'border-zinc-300 hover:border-indigo-400 dark:border-zinc-600'
      "
      :aria-label="todo.completed ? '标记为未完成' : '标记为已完成'"
      @click="onToggle(todo.id)"
    >
      <svg
        v-if="todo.completed"
        class="h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="3"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m4.5 12.75 6 6 9-13.5"
        />
      </svg>
    </button>

    <div class="min-w-0 flex-1">
      <input
        v-if="editing"
        v-model="editTitle"
        autofocus
        class="w-full rounded-lg border border-indigo-300 bg-white px-2 py-1 text-zinc-900 outline-none dark:border-indigo-600 dark:bg-zinc-900 dark:text-zinc-50"
        @blur="saveEdit"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
      />
      <p
        v-else
        class="break-words text-[15px] leading-snug"
        :class="
          todo.completed
            ? 'text-zinc-400 line-through dark:text-zinc-500'
            : 'text-zinc-900 dark:text-zinc-100'
        "
        @dblclick="!todo.completed && startEdit()"
      >
        {{ todo.title }}
      </p>

      <div class="mt-2 flex flex-wrap items-center gap-2">
        <span
          class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
          :class="priorityStyles[todo.priority].badge"
        >
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="priorityStyles[todo.priority].dot"
          />
          {{ priorityStyles[todo.priority].label }}
        </span>
        <span
          v-if="todo.dueDate"
          class="text-xs font-medium"
          :class="
            isOverdue(todo)
              ? 'text-rose-600 dark:text-rose-400'
              : isDueToday(todo)
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-zinc-500 dark:text-zinc-400'
          "
        >
          {{ isOverdue(todo) ? "已逾期 · " : isDueToday(todo) ? "今天 · " : "" }}
          {{ formatDate(todo.dueDate) }}
        </span>
      </div>
    </div>

    <div
      class="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100"
    >
      <button
        v-if="!todo.completed && !editing"
        type="button"
        aria-label="编辑"
        class="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
        @click="startEdit"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="删除"
        class="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
        @click="onDelete(todo.id)"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    </div>
  </li>
</template>
