import { ref, watch } from 'vue';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'livery-theme';

function readInitial(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

const theme = ref<Theme>(readInitial());

watch(
  theme,
  (value) => {
    document.documentElement.setAttribute('data-theme', value);
    localStorage.setItem(STORAGE_KEY, value);
  },
  { immediate: true },
);

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }

  return { theme, toggle };
}
