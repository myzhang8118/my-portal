<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="isDark ? '切换到白天模式' : '切换到夜间模式'"
    :title="isDark ? '夜间' : '白天'"
    @click="onToggle"
  >
    <span class="theme-toggle__svg" aria-hidden="true">
      <!-- 太阳：浅色 / 白天 -->
      <svg v-if="!isDark" class="theme-toggle__icon" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
        <path
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </svg>
      <!-- 月亮：深色 / 夜间 -->
      <svg v-else class="theme-toggle__icon" viewBox="0 0 24 24" fill="none">
        <path
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        />
      </svg>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { themeRef, setTheme } from '../utils/theme.js'

const isDark = computed(() => themeRef.value === 'dark')

function onToggle() {
  setTheme(isDark.value ? 'light' : 'dark')
}
</script>

<style scoped>
.theme-toggle {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--cyber-cyan) 35%, var(--border));
  background: color-mix(in srgb, var(--bg-card-solid) 55%, transparent);
  color: var(--cyber-cyan);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--ease-hover), border-color var(--ease-hover), box-shadow var(--ease-hover), color var(--ease-hover);
  box-shadow:
    inset 0 0 12px color-mix(in srgb, var(--cyber-cyan) 12%, transparent),
    0 0 14px color-mix(in srgb, var(--cyber-pink) 12%, transparent);
}
.theme-toggle:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--cyber-cyan) 65%, transparent);
  color: var(--text);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--cyber-cyan) 18%, transparent),
    0 0 22px color-mix(in srgb, var(--cyber-pink) 22%, transparent);
}
.theme-toggle__svg {
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-toggle__icon {
  width: 18px;
  height: 18px;
}
@media (max-width: 480px) {
  .theme-toggle {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
  }
  .theme-toggle__icon {
    width: 20px;
    height: 20px;
  }
}
</style>
