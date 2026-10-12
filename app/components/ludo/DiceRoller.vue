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
    myColor?: PlayerColor | null
    activePlayerName?: string
  }>(),
  {
    value: null,
    rolling: false,
    canRoll: true,
    myColor: null,
    activePlayerName: '',
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

const colorTheme: Record<PlayerColor, { ring: string; btn: string; text: string; glow: string }> = {
  red: { ring: 'ring-red-500', btn: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-900/40', text: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]' },
  green: { ring: 'ring-emerald-500', btn: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-900/40', text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]' },
  yellow: { ring: 'ring-amber-400', btn: 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black shadow-amber-900/40', text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]' },
  blue: { ring: 'ring-blue-500', btn: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-900/40', text: 'text-blue-400', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]' },
}

const handleRoll = () => {
  if (props.canRoll && !props.rolling) {
    emit('roll')
  }
}
</script>

<template>
  <div class="flex items-center justify-between gap-4 p-4 bg-surface border-2 border-border rounded-sm shadow-xl select-none">
    <div
      class="relative w-20 h-20 rounded-sm bg-slate-950 border-2 border-border flex items-center justify-center cursor-pointer transition-all duration-300"
      :class="[
        colorTheme[activeColor].ring,
        rolling ? 'animate-spin scale-110 shadow-2xl' : 'hover:scale-105',
        canRoll && !rolling ? `${colorTheme[activeColor].glow} ring-2 ring-offset-2 ring-offset-slate-950 animate-pulse` : 'opacity-85',
      ]"
      @click="handleRoll"
    >
      <HugeiconsIcon
        :icon="currentDiceIcon"
        :size="54"
        :class="[colorTheme[activeColor].text, rolling ? 'opacity-60 scale-95' : '']"
      />

      <span
        v-if="value && !rolling"
        class="absolute -top-2 -right-2 w-7 h-7 rounded-sm bg-amber-400 border border-slate-950 text-slate-950 text-sm font-black flex items-center justify-center shadow-lg animate-bounce"
      >
        {{ value }}
      </span>
    </div>

    <div class="flex flex-col flex-1 gap-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-neutral-300 uppercase tracking-wider">বর্তমান চাল:</span>
        <span
          class="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-sm"
          :class="colorTheme[activeColor].btn"
        >
          {{ activeColor }}
        </span>
      </div>

      <button
        type="button"
        class="w-full py-2.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg active:scale-95"
        :class="colorTheme[activeColor].btn"
        :disabled="!canRoll || rolling"
        @click="handleRoll"
      >
        <span v-if="rolling">ঘুরছে...</span>
        <span v-else-if="!canRoll && myColor && myColor !== activeColor">অপেক্ষা করুন... ({{ activePlayerName || activeColor }}-এর চাল)</span>
        <span v-else>🎲 ডাইস রোল করুন</span>
      </button>
    </div>
  </div>
</template>
