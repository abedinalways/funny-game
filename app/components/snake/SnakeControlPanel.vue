<template>
  <div class="flex flex-col gap-4 w-full max-w-[340px]">
    <div class="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl">
      <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">বর্তমান চাল</span>
        <span
          class="px-2 py-0.5 rounded text-xs font-bold"
          :class="getActiveBadgeClass(activePlayer.color)"
        >
          {{ activePlayer.name }}
        </span>
      </div>

      <div class="flex flex-col items-center justify-center py-4">
        <button
          type="button"
          class="relative w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-extrabold shadow-2xl transition-all duration-200 border-4"
          :class="[
            getDiceColorClass(activePlayer.color),
            isRolling ? 'animate-spin scale-95' : 'hover:scale-105 active:scale-95 cursor-pointer',
            isGameOver ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          :disabled="isRolling || isGameOver || activePlayer.isBot"
          @click="$emit('roll')"
        >
          <span v-if="diceValue !== null">{{ diceValue }}</span>
          <span v-else class="text-2xl opacity-75">🎲</span>
        </button>

        <p class="mt-3 text-xs text-center font-medium" :class="isRolling ? 'text-amber-400 animate-pulse' : 'text-slate-300'">
          {{ getActionStatusText() }}
        </p>
      </div>
    </div>

    <div class="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-slate-200">খেলোয়াড়দের অবস্থান</h3>
        <button
          type="button"
          class="text-xs text-slate-400 hover:text-slate-200 underline"
          @click="$emit('reset')"
        >
          রিসেট
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="p in players"
          :key="p.id"
          class="flex items-center justify-between p-2 rounded-lg border transition-all"
          :class="p.id === activePlayer.id ? 'bg-slate-800 border-slate-600 shadow' : 'bg-slate-900/60 border-slate-800/80'"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ p.avatar }}</span>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold" :class="getTextColorClass(p.color)">{{ p.name }}</span>
                <span v-if="p.hasWon" class="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold">
                  {{ p.rank === 1 ? '🥇 ১ম' : p.rank === 2 ? '🥈 ২য়' : p.rank === 3 ? '🥉 ৩য়' : '৪র্থ' }}
                </span>
              </div>
              <span class="text-[11px] text-slate-400 font-mono">ঘর: {{ p.position }} / ১০০</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-2 py-1 rounded text-[10px] font-semibold border transition"
              :class="p.isBot ? 'bg-purple-950/80 text-purple-300 border-purple-700/60' : 'bg-slate-800 text-slate-300 border-slate-700'"
              @click="$emit('toggle-bot', p.color)"
            >
              {{ p.isBot ? '🤖 Bot' : '👤 Man' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="lastMessage" class="rounded-xl bg-slate-900/90 border border-slate-800 p-3 shadow-xl">
      <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <span>📢 ধারাবিবরণী</span>
      </div>
      <p class="text-xs font-medium leading-relaxed" :class="getMessageColorClass()">
        {{ lastMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerColor } from '~/types/ludo'
import type { SnakePlayer } from '~/types/snakeLudo'

const props = defineProps<{
  players: SnakePlayer[]
  activePlayer: SnakePlayer
  diceValue: number | null
  isRolling: boolean
  isGameOver: boolean
  lastMessage: string | null
  lastMessageType: 'snake' | 'ladder' | 'six' | 'move' | null
}>()

defineEmits<{
  (e: 'roll'): void
  (e: 'reset'): void
  (e: 'toggle-bot', color: PlayerColor): void
}>()

const getActionStatusText = () => {
  if (props.isGameOver) return 'খেলা সমাপ্ত!'
  if (props.isRolling) return 'ডাইস ঘুরছে...'
  if (props.activePlayer.isBot) return 'বট চিন্তা করে চাল দিচ্ছে...'
  return 'ডাইস রোল করতে ট্যাপ করুন'
}

const getDiceColorClass = (color: PlayerColor) => {
  switch (color) {
    case 'red': return 'bg-rose-600 text-white border-rose-400 shadow-rose-600/30'
    case 'green': return 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/30'
    case 'yellow': return 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30'
    case 'blue': return 'bg-sky-600 text-white border-sky-400 shadow-sky-600/30'
  }
}

const getActiveBadgeClass = (color: PlayerColor) => {
  switch (color) {
    case 'red': return 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
    case 'green': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
    case 'yellow': return 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
    case 'blue': return 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
  }
}

const getTextColorClass = (color: PlayerColor) => {
  switch (color) {
    case 'red': return 'text-rose-400'
    case 'green': return 'text-emerald-400'
    case 'yellow': return 'text-amber-400'
    case 'blue': return 'text-sky-400'
  }
}

const getMessageColorClass = () => {
  switch (props.lastMessageType) {
    case 'snake': return 'text-rose-300'
    case 'ladder': return 'text-emerald-300'
    case 'six': return 'text-amber-300'
    default: return 'text-slate-300'
  }
}
</script>
