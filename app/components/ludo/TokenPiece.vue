<script setup lang="ts">
import type { PlayerColor, Token } from '~/types/ludo'

const props = withDefaults(
  defineProps<{
    token: Token
    canMove?: boolean
    isMoving?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    canMove: false,
    isMoving: false,
    size: 'md',
  }
)

const emit = defineEmits<{
  (e: 'select', token: Token): void
}>()

const colorStyles: Record<PlayerColor, { bg: string; border: string; glow: string; text: string }> = {
  red: {
    bg: 'bg-ludo-red',
    border: 'border-ludo-red-dark',
    glow: 'shadow-[0_0_12px_var(--color-ludo-red)]',
    text: 'text-ludo-red-light',
  },
  green: {
    bg: 'bg-ludo-green',
    border: 'border-ludo-green-dark',
    glow: 'shadow-[0_0_12px_var(--color-ludo-green)]',
    text: 'text-ludo-green-light',
  },
  yellow: {
    bg: 'bg-ludo-yellow',
    border: 'border-ludo-yellow-dark',
    glow: 'shadow-[0_0_12px_var(--color-ludo-yellow)]',
    text: 'text-ludo-yellow-light',
  },
  blue: {
    bg: 'bg-ludo-blue',
    border: 'border-ludo-blue-dark',
    glow: 'shadow-[0_0_12px_var(--color-ludo-blue)]',
    text: 'text-ludo-blue-light',
  },
}

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-5 h-5 text-[10px]'
    case 'lg':
      return 'w-9 h-9 text-sm'
    case 'md':
    default:
      return 'w-7 h-7 text-xs'
  }
})

const handleClick = () => {
  if (props.canMove) {
    emit('select', props.token)
  }
}
</script>

<template>
  <button
    type="button"
    class="relative inline-flex items-center justify-center font-bold transition-all duration-200 select-none rounded-sm border-2 shadow-md cursor-pointer"
    :class="[
      sizeClasses,
      colorStyles[token.color].bg,
      colorStyles[token.color].border,
      canMove ? `${colorStyles[token.color].glow} animate-bounce scale-110 z-20` : 'hover:scale-105',
      isMoving ? 'animate-pulse' : '',
    ]"
    :disabled="!canMove"
    @click="handleClick"
  >
    <span
      class="w-3/5 h-3/5 rounded-sm border border-white/40 flex items-center justify-center bg-black/15 shadow-inner"
      :class="colorStyles[token.color].text"
    >
      {{ token.index + 1 }}
    </span>
  </button>
</template>
