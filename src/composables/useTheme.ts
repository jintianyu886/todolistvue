import { onMounted, ref, watch } from "vue";

export type Theme = "light" | "dark";

const STORAGE_KEY = "todolist-theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme() {
  const theme = ref<Theme>("light");
  const mounted = ref(false);

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    theme.value = stored ?? getSystemTheme();
    mounted.value = true;
  });

  watch([theme, mounted], () => {
    if (!mounted.value) return;
    document.documentElement.classList.toggle("dark", theme.value === "dark");
    localStorage.setItem(STORAGE_KEY, theme.value);
  });

  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
  }

  return { theme, mounted, toggleTheme };
}
