<script setup lang="ts">
import { computed } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Cancel01Icon, Crown02Icon, RefreshIcon } from '@hugeicons/core-free-icons'
import type { PlayerColor } from '~/types/ludo'
import type { SnakePlayer } from '~/types/snakeLudo'

const props = defineProps<{
  isOpen: boolean
  winnerQueue: PlayerColor[]
  players: SnakePlayer[]
}>()

const emit = defineEmits<{
  (e: 'rematch'): void
  (e: 'close'): void
}>()

const getPlayerByColor = (color: PlayerColor): SnakePlayer | undefined => {
  return props.players.find(p => p.id === color)
}

const firstWinner = computed(() => (props.winnerQueue[0] ? getPlayerByColor(props.winnerQueue[0]) : null))
const secondWinner = computed(() => (props.winnerQueue[1] ? getPlayerByColor(props.winnerQueue[1]) : null))
const thirdWinner = computed(() => (props.winnerQueue[2] ? getPlayerByColor(props.winnerQueue[2]) : null))

const losers = computed(() => {
  return props.players.filter(p => !props.winnerQueue.includes(p.id))
})

const getBadgeColor = (color: PlayerColor) => {
  switch (color) {
    case 'red': return 'bg-rose-500'
    case 'green': return 'bg-emerald-500'
    case 'yellow': return 'bg-amber-400'
    case 'blue': return 'bg-sky-500'
  }
}

const getTextColor = (color: PlayerColor) => {
  switch (color) {
    case 'red': return 'text-rose-400'
    case 'green': return 'text-emerald-400'
    case 'yellow': return 'text-amber-400'
    case 'blue': return 'text-sky-400'
  }
}
</script>

<template>
  <div
    v-if="isOpen && winnerQueue.length > 0"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none"
  >
    <div class="relative w-full max-w-lg bg-surface border-2 border-border rounded-xl shadow-2xl p-6 overflow-hidden">
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
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-2 shadow-lg">
          <span class="text-3xl">🐍🏆</span>
        </div>
        <h2 class="text-xl md:text-2xl font-black uppercase tracking-wider text-neutral-50">
          সাপ-লুডু বিজয়ী উৎসব!
        </h2>
        <p class="text-xs text-amber-400 font-semibold">
          সাপের কামড় এড়িয়ে ১০০ ঘরে পৌঁছে ইতিহাস গড়ল চ্যাম্পিয়ন!
        </p>
      </div>

      <!-- Podium (1st, 2nd, 3rd) -->
      <div class="grid grid-cols-3 gap-2 items-end mb-6 pt-4">
        <!-- 2nd Place -->
        <div
          v-if="secondWinner"
          class="flex flex-col items-center animate-bounce delay-100"
        >
          <div class="text-2xl mb-1">{{ secondWinner.avatar }}</div>
          <span class="text-xs font-bold truncate max-w-full text-slate-300">{{ secondWinner.name }}</span>
          <span class="text-[10px] text-slate-400 mb-1">🥈 ২য় স্থান</span>
          <div class="w-full h-20 rounded-t-lg bg-slate-800 border-t-2 border-slate-600 flex items-center justify-center font-black text-xl text-slate-400 shadow-md">
            2
          </div>
        </div>
        <div v-else class="flex flex-col items-center opacity-30">
          <div class="w-full h-16 rounded-t-lg bg-slate-900 border-t border-slate-800"></div>
        </div>

        <!-- 1st Place (Champion) -->
        <div
          v-if="firstWinner"
          class="flex flex-col items-center -translate-y-2"
        >
          <div class="text-3xl mb-1 animate-pulse">{{ firstWinner.avatar }}</div>
          <span class="text-xs font-black truncate max-w-full text-amber-300">{{ firstWinner.name }}</span>
          <span class="text-[10px] text-amber-400 font-bold mb-1">🥇 চ্যাম্পিয়ন</span>
          <div class="w-full h-28 rounded-t-xl bg-gradient-to-t from-amber-600 to-amber-400 border-t-2 border-amber-200 flex items-center justify-center font-black text-3xl text-slate-950 shadow-2xl">
            1
          </div>
        </div>

        <!-- 3rd Place -->
        <div
          v-if="thirdWinner"
          class="flex flex-col items-center animate-bounce delay-200"
        >
          <div class="text-2xl mb-1">{{ thirdWinner.avatar }}</div>
          <span class="text-xs font-bold truncate max-w-full text-slate-300">{{ thirdWinner.name }}</span>
          <span class="text-[10px] text-slate-400 mb-1">🥉 ৩য় স্থান</span>
          <div class="w-full h-14 rounded-t-lg bg-amber-950 border-t-2 border-amber-800 flex items-center justify-center font-black text-lg text-amber-600 shadow-md">
            3
          </div>
        </div>
        <div v-else class="flex flex-col items-center opacity-30">
          <div class="w-full h-12 rounded-t-lg bg-slate-900 border-t border-slate-800"></div>
        </div>
      </div>

      <!-- Losers / Still in Board -->
      <div v-if="losers.length > 0" class="p-3 rounded-lg bg-slate-950/80 border border-border mb-5">
        <span class="text-[11px] font-bold uppercase text-neutral-400 block mb-2">
          সাপের ছোবলে আটকে থাকা যোদ্ধাগণ:
        </span>
        <div class="flex items-center gap-3 flex-wrap">
          <div
            v-for="l in losers"
            :key="l.id"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs"
          >
            <span>{{ l.avatar }}</span>
            <span class="font-bold" :class="getTextColor(l.color)">{{ l.name }}</span>
            <span class="text-[10px] text-slate-500 font-mono">({{ l.position }}/১০০)</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black uppercase rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 cursor-pointer shadow-lg transition"
          @click="emit('rematch')"
        >
          <HugeiconsIcon
            :icon="RefreshIcon"
            :size="15"
          />
          <span>আবার সাপ-লুডু খেলুন</span>
        </button>
      </div>
    </div>
  </div>
</template>
