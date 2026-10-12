<template>
  <div class="flex flex-col gap-3 sm:gap-4 w-full max-w-full sm:max-w-[420px] lg:max-w-[360px]">
    <!-- Dice Roller Card -->
    <div class="rounded-xl bg-surface border-2 border-border p-4 shadow-xl select-none">
      <div class="flex items-center justify-between mb-3 border-b border-border pb-2">
        <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">বর্তমান চাল</span>
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border" :class="getActiveBadgeClass(activePlayer.color)">
          <span class="text-sm">{{ activePlayer.avatar }}</span>
          <span class="text-xs font-black">{{ activePlayer.name }}</span>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center py-2">
        <button
          type="button"
          class="relative w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-extrabold shadow-2xl transition-all duration-200 border-2"
          :class="[
            getDiceColorClass(activePlayer.color),
            isRolling ? 'scale-95 ring-4 ring-amber-400 cursor-wait' : 'hover:scale-105 active:scale-95 cursor-pointer',
            isGameOver ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          :disabled="isRolling || isGameOver || activePlayer.isBot || (myColor ? myColor !== activePlayer.color : false)"
          @click="$emit('roll')"
        >
          <HugeiconsIcon
            :icon="currentDiceIcon"
            :size="54"
            :class="[isRolling ? 'animate-spin opacity-70' : '']"
          />

          <span
            v-if="diceValue !== null && !isRolling"
            class="absolute -top-2 -right-2 w-7 h-7 rounded-sm bg-amber-400 border border-slate-950 text-slate-950 text-sm font-black flex items-center justify-center shadow-lg animate-bounce"
          >
            {{ diceValue }}
          </span>
        </button>

        <p class="mt-3 text-xs text-center font-bold" :class="isRolling ? 'text-amber-400 animate-pulse' : 'text-neutral-300'">
          {{ getActionStatusText() }}
        </p>
      </div>
    </div>

    <!-- Players Position Card -->
    <div class="rounded-xl bg-surface border-2 border-border p-4 shadow-xl select-none">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-extrabold text-neutral-200 uppercase tracking-wider">খেলোয়াড়দের অবস্থান</h3>
        <button
          type="button"
          class="text-xs text-neutral-400 hover:text-amber-400 underline font-semibold transition"
          @click="$emit('reset')"
        >
          রিসেট করুন
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="p in players"
          :key="p.id"
          class="flex items-center justify-between p-2.5 rounded-sm border transition-all"
          :class="p.id === activePlayer.id ? 'bg-slate-900 border-amber-400/80 shadow-md ring-1 ring-amber-400/30' : 'bg-slate-950/60 border-border/50'"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-xl">{{ p.avatar }}</span>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-extrabold uppercase" :class="getTextColorClass(p.color)">{{ p.name }}</span>
                <span v-if="p.hasWon" class="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-sm text-[10px] font-bold">
                  {{ p.rank === 1 ? '🥇 ১ম' : p.rank === 2 ? '🥈 ২য়' : p.rank === 3 ? '🥉 ৩য়' : '৪র্থ' }}
                </span>
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[11px] text-neutral-400 font-mono font-bold">ঘর: {{ p.position }} / ১০০</span>
                <div class="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 transition-all duration-300" :style="{ width: `${p.position}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-2 py-1 rounded-sm text-[10px] font-extrabold border uppercase tracking-wider transition cursor-pointer"
              :class="p.isBot ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60 hover:bg-indigo-900/60' : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'"
              @click="$emit('toggle-bot', p.color)"
            >
              {{ p.isBot ? '🤖 Bot' : '👤 Man' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Trash Talk / Commentary Feed -->
    <div class="flex flex-col h-[220px] bg-surface border-2 border-border rounded-xl shadow-xl overflow-hidden">
      <div class="flex items-center gap-2 px-3 py-2 border-b border-border bg-slate-950/60">
        <span class="text-amber-400 text-sm">📢</span>
        <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-200">
          সাপ-লুডু লাইভ ধারাবিবরণী
        </h3>
      </div>

      <div class="flex-1 p-2 space-y-1.5 overflow-y-auto">
        <div v-if="history.length === 0" class="text-center py-6 text-xs text-neutral-400 italic">
          ডাইস রোল করুন, সাপের কামড় ও সিঁড়ি বেয়ে ওঠার মজার ধারাভাষ্য এখানে ভাসবে!
        </div>

        <div
          v-for="msg in history"
          :key="msg.id"
          class="flex items-start gap-2 p-1.5 rounded-sm border transition-all"
          :class="getHistoryCardClass(msg.type)"
        >
          <span
            class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm shrink-0 mt-0.5"
            :class="getPlayerBadgeColor(msg.color)"
          >
            {{ msg.sender }}
          </span>
          <p class="text-xs text-neutral-100 leading-snug break-words">
            {{ msg.text }}
          </p>
        </div>
      </div>

      <!-- Live Chat Input in Snake Mode -->
      <form class="p-1.5 border-t border-border bg-slate-950/60 flex items-center gap-1.5" @submit.prevent="handleSendChat">
        <input
          v-model="inputChatText"
          type="text"
          placeholder="সাপ-লুডু চ্যাট পাঠান... (Enter)"
          class="flex-1 px-2.5 py-1 rounded-sm bg-slate-900 border border-border text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition"
        />
        <button
          type="submit"
          class="inline-flex items-center justify-center p-1.5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow transition"
          :disabled="!inputChatText.trim()"
        >
          <HugeiconsIcon
            :icon="SentIcon"
            :size="13"
          />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  Dice,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  SentIcon,
} from '@hugeicons/core-free-icons'
import type { PlayerColor } from '~/types/ludo'
import type { SnakePlayer, SnakeHistoryMessage } from '~/types/snakeLudo'

const props = defineProps<{
  players: SnakePlayer[]
  activePlayer: SnakePlayer
  diceValue: number | null
  isRolling: boolean
  isGameOver: boolean
  history: SnakeHistoryMessage[]
  myColor?: PlayerColor | null
}>()

const emit = defineEmits<{
  (e: 'roll'): void
  (e: 'reset'): void
  (e: 'toggle-bot', color: PlayerColor): void
  (e: 'sendMessage', text: string): void
}>()

const inputChatText = ref('')

const handleSendChat = () => {
  const text = inputChatText.value.trim()
  if (!text) return
  emit('sendMessage', text)
  inputChatText.value = ''
}

const diceIcons = [Dice, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

const currentDiceIcon = computed(() => {
  if (props.isRolling || !props.diceValue) return Dice
  return diceIcons[props.diceValue] || Dice
})

const getActionStatusText = () => {
  if (props.isGameOver) return '🏆 খেলা সমাপ্ত!'
  if (props.isRolling) return '🎲 ডাইস ঘুরছে...'
  if (props.activePlayer.isBot) return '🤖 বট চিন্তা করে চাল দিচ্ছে...'
  if (props.myColor && props.myColor !== props.activePlayer.color) {
    return `অপেক্ষা করুন... (${props.activePlayer.name}-এর চাল)`
  }
  return 'ডাইস রোল করতে ট্যাপ করুন'
}

const getDiceColorClass = (color: PlayerColor) => {
  switch (color) {
    case 'red': return 'bg-gradient-to-br from-red-500 to-rose-700 text-white border-red-400 shadow-red-900/50'
    case 'green': return 'bg-gradient-to-br from-emerald-500 to-green-700 text-white border-emerald-400 shadow-emerald-900/50'
    case 'yellow': return 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black border-amber-300 shadow-amber-900/50'
    case 'blue': return 'bg-gradient-to-br from-sky-500 to-blue-700 text-white border-sky-400 shadow-blue-900/50'
  }
}

const getActiveBadgeClass = (color: PlayerColor) => {
  switch (color) {
    case 'red': return 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    case 'green': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    case 'yellow': return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    case 'blue': return 'bg-sky-500/20 text-sky-300 border-sky-500/40'
  }
}

const getPlayerBadgeColor = (color: PlayerColor) => {
  switch (color) {
    case 'red': return 'bg-rose-600 text-white'
    case 'green': return 'bg-emerald-600 text-white'
    case 'yellow': return 'bg-amber-400 text-slate-950 font-bold'
    case 'blue': return 'bg-sky-600 text-white'
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

const getHistoryCardClass = (type: SnakeHistoryMessage['type']) => {
  switch (type) {
    case 'snake': return 'bg-red-950/60 border-red-800/60'
    case 'ladder': return 'bg-emerald-950/60 border-emerald-800/60'
    case 'six': return 'bg-amber-950/60 border-amber-800/60'
    case 'win': return 'bg-yellow-950/70 border-yellow-500/60'
    default: return 'bg-slate-900/60 border-border/30'
  }
}
</script>
