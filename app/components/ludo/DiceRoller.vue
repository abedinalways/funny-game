<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  Dice,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
} from '@hugeicons/core-free-icons'
import type { PlayerColor } from '~/types/ludo'

const props = withDefaults(
  defineProps<{
    value: number | null
    rolling: boolean
    activeColor: PlayerColor
    canRoll: boolean
  }>(),
  {
    value: null,
    rolling: false,
    canRoll: true,
  }
)

const emit = defineEmits<{
  (e: 'roll'): void
}>()

const diceIcons = [Dice, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

const currentDiceIcon = computed(() => {
  if (props.rolling || !props.value) return Dice
  return diceIcons[props.value] || Dice
})

const colorTheme: Record<PlayerColor, { ring: string; btn: string; text: string }> = {
  red: { ring: 'ring-ludo-red', btn: 'bg-ludo-red text-white hover:bg-ludo-red-dark', text: 'text-ludo-red' },
  green: { ring: 'ring-ludo-green', btn: 'bg-ludo-green text-white hover:bg-ludo-green-dark', text: 'text-ludo-green' },
  yellow: { ring: 'ring-ludo-yellow', btn: 'bg-ludo-yellow text-slate-900 hover:bg-ludo-yellow-dark', text: 'text-ludo-yellow' },
  blue: { ring: 'ring-ludo-blue', btn: 'bg-ludo-blue text-white hover:bg-ludo-blue-dark', text: 'text-ludo-blue' },
}

const handleRoll = () => {
  if (props.canRoll && !props.rolling) {
    emit('roll')
  }
}
</script>

<template>
  <div class="flex items-center gap-3 p-3 bg-surface border border-border rounded-sm shadow-lg select-none">
    <div
      class="relative w-16 h-16 rounded-sm bg-slate-950 border-2 border-border/80 flex items-center justify-center cursor-pointer transition-all duration-300"
      :class="[
        colorTheme[activeColor].ring,
        rolling ? 'animate-spin scale-110 shadow-lg' : 'hover:scale-105',
        canRoll && !rolling ? 'ring-2 ring-offset-2 ring-offset-slate-900 animate-pulse' : 'opacity-80',
      ]"
      @click="handleRoll"
    >
      <HugeiconsIcon
        :icon="currentDiceIcon"
        :size="42"
        :class="[colorTheme[activeColor].text, rolling ? 'opacity-70' : '']"
      />

      <span
        v-if="value && !rolling"
        class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-sm bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shadow"
      >
        {{ value }}
      </span>
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-neutral-300">Turn:</span>
        <span
          class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm"
          :class="colorTheme[activeColor].btn"
        >
          {{ activeColor }}
        </span>
      </div>

      <button
        type="button"
        class="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow"
        :class="colorTheme[activeColor].btn"
        :disabled="!canRoll || rolling"
        @click="handleRoll"
      >
        {{ rolling ? 'Rolling...' : 'Roll Dice' }}
      </button>
    </div>
  </div>
</template>
