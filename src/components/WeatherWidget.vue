<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { getWeather, getCityList, type WeatherResponse } from "@/lib/weather";

const weather = ref<WeatherResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedCity = ref("110000");

const cities = getCityList();

const currentWeather = computed(() => weather.value?.lives?.[0]);
const forecast = computed(() => weather.value?.forecasts?.[0]?.casts?.slice(0, 3));

const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const weatherIcons: Record<string, string> = {
  "晴": "☀️",
  "多云": "⛅",
  "阴": "☁️",
  "小雨": "🌧️",
  "中雨": "🌧️",
  "大雨": "⛈️",
  "雷阵雨": "⛈️",
  "雪": "❄️",
  "雾": "🌫️",
};

function getWeatherIcon(weather: string): string {
  return weatherIcons[weather] || "🌤️";
}

function formatTime(time: string): string {
  return time.slice(11, 16);
}

function getWeekDay(dateStr: string): string {
  const date = new Date(dateStr);
  return weekDays[date.getDay()];
}

async function fetchWeather() {
  loading.value = true;
  error.value = null;
  
  try {
    weather.value = await getWeather(selectedCity.value);
  } catch (e) {
    error.value = "获取天气失败";
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchWeather();
});
</script>

<template>
  <div class="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
    <div class="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div class="flex items-center gap-2">
        <svg class="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
        </svg>
        <span class="font-medium text-zinc-900 dark:text-zinc-100">天气预报</span>
      </div>
      <select
        v-model="selectedCity"
        @change="fetchWeather"
        class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none focus:border-sky-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
      >
        <option v-for="city in cities" :key="city.code" :value="city.code">
          {{ city.name }}
        </option>
      </select>
    </div>
    
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="flex gap-1">
        <span class="inline-block h-2 w-2 animate-bounce rounded-full bg-sky-400"></span>
        <span class="inline-block h-2 w-2 animate-bounce rounded-full bg-sky-400" style="animation-delay: 0.1s"></span>
        <span class="inline-block h-2 w-2 animate-bounce rounded-full bg-sky-400" style="animation-delay: 0.2s"></span>
      </div>
    </div>
    
    <div v-else-if="error" class="py-8 text-center text-sm text-rose-600 dark:text-rose-400">
      {{ error }}
    </div>
    
    <div v-else-if="currentWeather" class="p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400">{{ currentWeather.city }}</p>
          <p class="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {{ currentWeather.temperature }}°C
          </p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-2xl">{{ getWeatherIcon(currentWeather.weather) }}</span>
            <span class="text-sm text-zinc-700 dark:text-zinc-300">{{ currentWeather.weather }}</span>
          </div>
        </div>
        <div class="text-right text-xs text-zinc-500 dark:text-zinc-400">
          <p>湿度 {{ currentWeather.humidity }}%</p>
          <p>{{ currentWeather.winddirection }} {{ currentWeather.windpower }}级</p>
          <p>更新于 {{ formatTime(currentWeather.reporttime) }}</p>
        </div>
      </div>
      
      <div v-if="forecast" class="mt-4 flex border-t border-zinc-200 pt-4 justify-between dark:border-zinc-700">
        <div v-for="day in forecast" :key="day.date" class="text-center">
          <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ getWeekDay(day.date) }}</p>
          <span class="text-lg">{{ getWeatherIcon(day.dayweather) }}</span>
          <p class="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
            {{ day.nighttemp }}°~{{ day.daytemp }}°
          </p>
        </div>
      </div>
    </div>
  </div>
</template>