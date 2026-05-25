<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from "vue";
import { chatWithAI, type ChatMessage } from "@/lib/deepseek";
import {
  type ChatSession,
  getChatHistory,
  saveChatSession,
  deleteChatSession,
  createNewSession,
  generateTitle,
} from "@/lib/chat-history";

const emit = defineEmits<{
  (e: "add-todo", title: string): void;
}>();

const inputMessage = ref("");
const currentSession = ref<ChatSession>(createNewSession());
const history = ref<ChatSession[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const chatContainer = ref<HTMLElement | null>(null);

const defaultMessages = [
  {
    role: "assistant" as const,
    content: "你好！我是你的智能待办助手。请问有什么可以帮你的？\n\n你可以：\n- 让我帮你生成待办建议\n- 问我任何问题\n- 或者直接添加任务",
  },
];

onMounted(() => {
  history.value = getChatHistory();
  if (history.value.length > 0) {
    currentSession.value = { ...history.value[0] };
    if (currentSession.value.messages.length === 0) {
      currentSession.value.messages = [...defaultMessages];
    }
  } else {
    currentSession.value.messages = [...defaultMessages];
  }
});

async function sendMessage() {
  if (!inputMessage.value.trim() || loading.value) return;
  
  const userMessage = inputMessage.value.trim();
  inputMessage.value = "";
  loading.value = true;
  error.value = null;
  
  currentSession.value.messages.push({ role: "user", content: userMessage });
  await nextTick();
  scrollToBottom();
  
  try {
    const chatMessages: ChatMessage[] = currentSession.value.messages.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));
    
    const response = await chatWithAI(chatMessages);
    currentSession.value.messages.push({ role: "assistant", content: response });
    
    currentSession.value.title = generateTitle(currentSession.value.messages);
    currentSession.value.updatedAt = Date.now();
    saveChatSession(currentSession.value);
    history.value = getChatHistory();
  } catch (e) {
    error.value = "对话失败，请稍后重试";
    console.error(e);
  } finally {
    loading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function startNewSession() {
  currentSession.value = createNewSession();
  currentSession.value.messages = [...defaultMessages];
}

function loadSession(session: ChatSession) {
  currentSession.value = { ...session };
  setTimeout(() => scrollToBottom(), 100);
}

function removeSession(id: string) {
  deleteChatSession(id);
  history.value = getChatHistory();
  if (currentSession.value.id === id) {
    startNewSession();
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
  
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

const hasHistory = computed(() => history.value.length > 0);
</script>

<template>
  <div class="flex rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-700">
    <div class="w-56 flex-shrink-0 border-r border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div class="flex items-center gap-2 border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
        <svg class="h-4 w-4 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
        <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">历史对话</span>
      </div>
      
      <div class="p-2">
        <button
          type="button"
          class="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
          @click="startNewSession"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新对话
        </button>
      </div>
      
      <div v-if="!hasHistory" class="px-3 py-8 text-center">
        <p class="text-xs text-zinc-500 dark:text-zinc-400">暂无对话历史</p>
      </div>
      
      <div v-else class="max-h-64 overflow-y-auto px-2 pb-2 space-y-1">
        <div
          v-for="session in history"
          :key="session.id"
          class="group flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition"
          :class="currentSession.id === session.id 
            ? 'bg-indigo-100 dark:bg-indigo-900/30' 
            : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'"
          @click="loadSession(session)"
        >
          <div class="flex-1 min-w-0">
            <p class="truncate text-zinc-900 dark:text-zinc-100">{{ session.title }}</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ formatDate(session.updatedAt) }}</p>
          </div>
          <button
            type="button"
            class="ml-2 opacity-0 transition group-hover:opacity-100"
            @click.stop="removeSession(session.id)"
          >
            <svg class="h-3.5 w-3.5 text-zinc-400 hover:text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="flex-1 flex flex-col bg-white dark:bg-zinc-800/50">
      <div class="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/50">
        <svg class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span class="font-medium text-zinc-900 dark:text-zinc-100">AI 智能助手</span>
      </div>
      
      <div 
        ref="chatContainer"
        class="flex-1 max-h-80 overflow-y-auto p-4 space-y-4"
      >
        <div
          v-for="(msg, index) in currentSession.messages"
          :key="index"
          class="flex gap-3"
          :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
        >
          <div 
            class="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium"
            :class="msg.role === 'user' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'"
          >
            {{ msg.role === 'user' ? '你' : 'AI' }}
          </div>
          <div 
            class="max-w-[75%] rounded-xl px-4 py-2.5 text-sm"
            :class="msg.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-br-md' 
              : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100 rounded-bl-md'"
          >
            <p class="whitespace-pre-wrap">{{ msg.content }}</p>
          </div>
        </div>
        
        <div v-if="loading" class="flex gap-3">
          <div class="shrink-0 h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-medium dark:bg-zinc-700">
            AI
          </div>
          <div class="bg-zinc-100 rounded-xl px-4 py-2.5 dark:bg-zinc-700">
            <div class="flex gap-1">
              <span class="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400"></span>
              <span class="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400" style="animation-delay: 0.1s"></span>
              <span class="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400" style="animation-delay: 0.2s"></span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="error" class="border-t border-zinc-200 bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:border-zinc-700 dark:bg-rose-950/40 dark:text-rose-400">
        {{ error }}
      </div>
      
      <div class="border-t border-zinc-200 p-3 dark:border-zinc-700">
        <div class="flex gap-2">
          <textarea
            v-model="inputMessage"
            placeholder="输入消息，按 Enter 发送..."
            :disabled="loading"
            rows="1"
            class="flex-1 resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            @keydown="handleKeydown"
          />
          <button
            type="button"
            :disabled="loading || !inputMessage.trim()"
            class="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
            @click="sendMessage"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">按 Shift + Enter 换行</p>
      </div>
    </div>
  </div>
</template>