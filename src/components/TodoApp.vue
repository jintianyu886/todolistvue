<script setup lang="ts">
import { computed, ref } from "vue";
import { useTheme } from "@/composables/useTheme";
import { useTodos } from "@/composables/useTodos";
import type { Filter } from "@/types/todo";
import FilterBar from "./FilterBar.vue";
import ThemeToggle from "./ThemeToggle.vue";
import TodoForm from "./TodoForm.vue";
import TodoList from "./TodoList.vue";

const filter = ref<Filter>("all");
const { theme, mounted, toggleTheme } = useTheme();
const {
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
} = useTodos();

const counts = computed(() => ({
  all: stats.value.total,
  active: stats.value.active,
  completed: stats.value.completed,
}));

const subtitle = computed(() => {
  if (stats.value.active > 0) return `${stats.value.active} 项待完成`;
  if (stats.value.total > 0) return "全部完成，干得漂亮";
  return "管理你的日常任务";
});
</script>

<template>
  <div
    v-if="!hydrated || !mounted"
    class="mx-auto w-full max-w-xl px-4 py-16"
  >
    <div class="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
    <div class="mt-8 h-12 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    <div class="mt-4 space-y-2">
      <div
        v-for="i in 3"
        :key="i"
        class="h-16 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
      />
    </div>
  </div>

  <div v-else class="mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
    <header class="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          待办清单
        </h1>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {{ subtitle }}
        </p>
      </div>
      <ThemeToggle :theme="theme" @toggle="toggleTheme" />
    </header>

    <div
      v-if="error"
      role="alert"
      class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
    >
      {{ error }}
    </div>

    <section class="space-y-6">
      <TodoForm :disabled="!apiOnline" :on-add="addTodo" />
      <FilterBar
        :filter="filter"
        :counts="counts"
        @update:filter="filter = $event"
      />
      <TodoList
        :todos="todos"
        :filter="filter"
        :on-toggle="toggleTodo"
        :on-update="updateTodo"
        :on-delete="deleteTodo"
      />
      <div v-if="stats.completed > 0" class="flex justify-center pt-2">
        <button
          type="button"
          class="text-sm text-zinc-500 transition hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
          @click="clearCompleted"
        >
          清除 {{ stats.completed }} 项已完成
        </button>
      </div>
    </section>

    <footer class="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-600">
      <span
        class="mr-2 inline-block h-1.5 w-1.5 rounded-full"
        :class="apiOnline ? 'bg-emerald-500' : 'bg-rose-500'"
      />
      {{ apiOnline ? "已连接 demo-backend" : "后端未连接" }} · 双击任务可编辑
    </footer>
  </div>
</template>
