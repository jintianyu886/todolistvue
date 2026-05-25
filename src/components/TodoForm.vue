<script setup lang="ts">
import { ref } from "vue";
import type { Priority, TodoInput } from "@/types/todo";

const props = defineProps<{
  disabled?: boolean;
  onAdd: (input: TodoInput) => Promise<boolean>;
}>();

const title = ref("");
const priority = ref<Priority>("medium");
const dueDate = ref("");
const submitting = ref(false);

const priorities: { value: Priority; label: string }[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

async function onSubmit() {
  if (props.disabled || submitting.value) return;
  submitting.value = true;
  const ok = await props.onAdd({
    title: title.value,
    priority: priority.value,
    dueDate: dueDate.value || null,
  });
  submitting.value = false;
  if (ok) {
    title.value = "";
    dueDate.value = "";
    priority.value = "medium";
  }
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="onSubmit">
    <div class="flex gap-2">
      <input
        v-model="title"
        type="text"
        placeholder="添加新任务…"
        :disabled="disabled || submitting"
        class="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500"
      />
      <button
        type="submit"
        :disabled="disabled || submitting"
        class="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50"
      >
        {{ submitting ? "…" : "添加" }}
      </button>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <label class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span>优先级</span>
        <select
          v-model="priority"
          :disabled="disabled || submitting"
          class="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option v-for="p in priorities" :key="p.value" :value="p.value">
            {{ p.label }}
          </option>
        </select>
      </label>
      <label class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span>截止日期</span>
        <input
          v-model="dueDate"
          type="date"
          :disabled="disabled || submitting"
          class="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </label>
    </div>
  </form>
</template>
