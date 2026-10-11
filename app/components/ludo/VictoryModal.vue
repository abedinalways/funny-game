<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Award01Icon, Cancel01Icon, Crown02Icon, RefreshIcon } from '@hugeicons/core-free-icons'
import type { Player, PlayerColor } from '~/types/ludo'

const props = defineProps<{
  isOpen: boolean
  winners: PlayerColor[]
  players: Player[]
}>()

const emit = defineEmits<{
  (e: 'rematch'): void
  (e: 'close'): void
}>()

const playerColorStyles: Record<PlayerColor, { bg: string; text: string; border: string }> = {
  red: { bg: 'bg-ludo-red', text: 'text-ludo-red', border: 'border-ludo-red' },
  green: { bg: 'bg-ludo-green', text: 'text-ludo-green', border: 'border-ludo-green' },
  yellow: { bg: 'bg-ludo-yellow', text: 'text-ludo-yellow', border: 'border-ludo-yellow' },
  blue: { bg: 'bg-ludo-blue', text: 'text-ludo-blue', border: 'border-ludo-blue' },
}

const getPlayerByColor = (color: PlayerColor): Player | undefined => {
  return props.players.find(p => p.color === color)
}

const firstWinner = computed(() => (props.winners[0] ? getPlayerByColor(props.winners[0]) : null))
const secondWinner = computed(() => (props.winners[1] ? getPlayerByColor(props.winners[1]) : null))
const thirdWinner = computed(() => (props.winners[2] ? getPlayerByColor(props.winners[2]) : null))

const losers = computed(() => {
  return props.players.filter(p => !props.winners.includes(p.color))
})
</script>

<template>
  <div
    v-if="isOpen && winners.length > 0"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
  >
    <div class="relative w-full max-w-lg bg-surface border-2 border-border rounded-sm shadow-2xl p-6 overflow-hidden select-none">
      <button
        type="button"
        class="absolute top-3 right-3 p-1.5 rounded-sm bg-slate-900 border border-border text-neutral-400 hover:text-white transition-colors cursor-pointer"
        @click="emit('close')"
      >
        <HugeiconsIcon
          :icon="Cancel01Icon"
          :size="16"
        />
      </button>

      <div class="text-center space-y-1 mb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-sm bg-amber-400/20 text-amber-400 border border-amber-400/40 mb-2">
          <HugeiconsIcon
            :icon="Crown02Icon"
            :size="28"
          />
        </div>
        <h2 class="text-xl md:text-2xl font-black uppercase tracking-wider text-neutral-50">
          খেলা সমাপ্ত! জয়জয়কার!
        </h2>
        <p class="text-xs text-amber-400 font-medium">
          চ্যাম্পিয়নকে সালাম! বাকিরা চা-শিঙ্গাড়া খাওয়ার ব্যবস্থা করুন!
        </p>
      </div>

      <div class="grid grid-cols-3 gap-2 items-end mb-6 pt-4">
        <!-- 2nd Place -->
        <div class="flex flex-col items-center">
          <template v-if="secondWinner">
            <span class="text-[10px] font-bold text-slate-300 mb-1 truncate max-w-[90px]">
              {{ secondWinner.name }}
            </span>
            <div class="w-10 h-10 rounded-sm border-2 flex items-center justify-center text-xs font-black shadow"
                 :class="[playerColorStyles[secondWinner.color].bg, playerColorStyles[secondWinner.color].border]">
              2nd
            </div>
          </template>
          <div
            v-else
            class="h-10 text-[10px] text-neutral-500 flex items-center"
          >
            -
          </div>
          <div class="w-full h-16 bg-slate-800/90 border border-border rounded-sm mt-1 flex flex-col items-center justify-center text-slate-300">
            <span class="text-sm font-black">🥈</span>
            <span class="text-[9px] uppercase font-bold">Runner Up</span>
          </div>
        </div>

        <!-- 1st Place (Center & Highest) -->
        <div class="flex flex-col items-center">
          <template v-if="firstWinner">
            <span class="text-xs font-black text-amber-300 mb-1 truncate max-w-[110px]">
              {{ firstWinner.name }}
            </span>
            <div class="w-14 h-14 rounded-sm border-2 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 flex items-center justify-center text-sm font-black shadow-lg animate-bounce"
                 :class="[playerColorStyles[firstWinner.color].bg, playerColorStyles[firstWinner.color].border]">
              <HugeiconsIcon
                :icon="Award01Icon"
                :size="26"
                class="text-white drop-shadow"
              />
            </div>
          </template>
          <div class="w-full h-24 bg-amber-500/20 border-2 border-amber-400/80 rounded-sm mt-1 flex flex-col items-center justify-center text-amber-400 shadow-inner">
            <span class="text-lg font-black">🏆 1st</span>
            <span class="text-[10px] font-extrabold uppercase tracking-wider">বাদশাহ</span>
          </div>
        </div>

        <!-- 3rd Place -->
        <div class="flex flex-col items-center">
          <template v-if="thirdWinner">
            <span class="text-[10px] font-bold text-amber-600 mb-1 truncate max-w-[90px]">
              {{ thirdWinner.name }}
            </span>
            <div class="w-10 h-10 rounded-sm border-2 flex items-center justify-center text-xs font-black shadow"
                 :class="[playerColorStyles[thirdWinner.color].bg, playerColorStyles[thirdWinner.color].border]">
              3rd
            </div>
          </template>
          <div
            v-else
            class="h-10 text-[10px] text-neutral-500 flex items-center"
          >
            -
          </div>
          <div class="w-full h-12 bg-slate-800/90 border border-border rounded-sm mt-1 flex flex-col items-center justify-center text-amber-700">
            <span class="text-sm font-black">🥉</span>
            <span class="text-[9px] uppercase font-bold">3rd</span>
          </div>
        </div>
      </div>

      <!-- Losers / Troll Section -->
      <div
        v-if="losers.length > 0"
        class="p-2.5 rounded-sm bg-slate-900/90 border border-border/60 mb-6 text-center"
      >
        <span class="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
          🤡 হারু পার্টি (পরাজিত বাহিনী):
        </span>
        <div class="flex items-center justify-center gap-2 flex-wrap">
          <span
            v-for="loser in losers"
            :key="loser.id"
            class="text-xs px-2 py-0.5 rounded-sm bg-slate-950 border border-rose-500/30 text-neutral-300"
          >
            {{ loser.name }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-amber-400 hover:bg-amber-500 text-slate-950 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-lg"
          @click="emit('rematch')"
        >
          <HugeiconsIcon
            :icon="RefreshIcon"
            :size="16"
          />
          <span>আরেক হাত হয়ে যাক (Rematch)</span>
        </button>
      </div>
    </div>
  </div>
</template>
