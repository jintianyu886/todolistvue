<script setup lang="ts">
import type { Filter } from "@/types/todo";

const props = defineProps<{
  filter: Filter;
  counts: { all: number; active: number; completed: number };
}>();

const emit = defineEmits<{
  "update:filter": [value: Filter];
}>();

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "active", label: "进行中" },
  { value: "completed", label: "已完成" },
];

function countFor(value: Filter) {
  if (value === "all") return props.counts.all;
  if (value === "active") return props.counts.active;
  return props.counts.completed;
}
</script>

<template>
  <div class="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
    <button
      v-for="item in filters"
      :key="item.value"
      type="button"
      class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition"
      :class="
        filter === item.value
          ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
      "
      @click="emit('update:filter', item.value)"
    >
      {{ item.label }}
      <span class="ml-1.5 tabular-nums text-zinc-400 dark:text-zinc-500">
        {{ countFor(item.value) }}
      </span>
    </button>
  </div>
</template>
