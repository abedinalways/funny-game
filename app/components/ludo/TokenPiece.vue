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

const colorStyles: Record<PlayerColor, { bg: string; border: string; glow: string; text: string; ring: string }> = {
  red: {
    bg: 'bg-gradient-to-br from-red-400 via-ludo-red to-red-700',
    border: 'border-red-900',
    glow: 'shadow-[0_0_16px_rgba(239,68,68,0.9)] ring-2 ring-red-300',
    text: 'text-white',
    ring: 'border-red-200/60',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-300 via-ludo-green to-emerald-800',
    border: 'border-emerald-950',
    glow: 'shadow-[0_0_16px_rgba(34,197,94,0.9)] ring-2 ring-emerald-300',
    text: 'text-white',
    ring: 'border-emerald-200/60',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-200 via-ludo-yellow to-amber-700',
    border: 'border-amber-950',
    glow: 'shadow-[0_0_16px_rgba(234,179,8,0.9)] ring-2 ring-yellow-200',
    text: 'text-slate-950 font-black',
    ring: 'border-yellow-950/40',
  },
  blue: {
    bg: 'bg-gradient-to-br from-sky-300 via-ludo-blue to-blue-800',
    border: 'border-blue-950',
    glow: 'shadow-[0_0_16px_rgba(59,130,246,0.9)] ring-2 ring-sky-300',
    text: 'text-white',
    ring: 'border-blue-200/60',
  },
}

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-6 h-6 text-[10px]'
    case 'lg':
      return 'w-11 h-11 text-sm'
    case 'md':
    default:
      return 'w-8 h-8 md:w-9 md:h-9 text-xs'
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
    class="relative inline-flex items-center justify-center font-black transition-all duration-200 select-none rounded-sm border-2 shadow-lg cursor-pointer transform"
    :class="[
      sizeClasses,
      colorStyles[token.color].bg,
      colorStyles[token.color].border,
      canMove ? `${colorStyles[token.color].glow} animate-bounce scale-110 z-30 ring-offset-2 ring-offset-slate-950` : 'hover:scale-105',
      isMoving ? 'animate-pulse scale-125 z-40' : '',
    ]"
    :disabled="!canMove"
    @click="handleClick"
  >
    <span
      class="w-3/5 h-3/5 rounded-sm border flex items-center justify-center bg-black/20 shadow-inner"
      :class="[colorStyles[token.color].ring, colorStyles[token.color].text]"
    >
      {{ token.index + 1 }}
    </span>

    <span
      v-if="canMove"
      class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-sm bg-amber-400 border border-slate-950 animate-ping"
    />
  </button>
</template>
