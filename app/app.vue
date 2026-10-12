<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Crown02Icon, RefreshIcon, VolumeHighIcon, VolumeMute01Icon, AiGameIcon, User02Icon } from '@hugeicons/core-free-icons'

import type { EmojiTauntItem } from '~/types/taunt'
import { useEmojiTaunts } from '~/composables/useEmojiTaunts'

const {
  players,
  activePlayerColor,
  activePlayer,
  diceValue,
  isRolling,
  phase,
  canMoveTokenIds,
  destinationMap,
  canRollDice,
  movingTokenId,
  winners,
  history,
  isMuted,
  toggleMute,
  togglePlayerBot,
  rollDice,
  selectToken,
  resetGame,
} = useLudoEngine()

const { activeTaunts, triggerTaunt, triggerRandomBotTaunt } = useEmojiTaunts()

const handleSendTaunt = (taunt: EmojiTauntItem) => {
  triggerTaunt(taunt, activePlayerColor.value, activePlayer.value.name)
}

watch(
  () => history.value[0],
  (latest) => {
    if (latest) {
      const player = players.value.find(p => p.color === latest.color)
      if (player && player.isBot && Math.random() < 0.6) {
        setTimeout(() => {
          triggerRandomBotTaunt(player.color, player.name)
        }, 350)
      }
    }
  }
)

const isVictoryModalOpen = ref(false)

watch(
  () => winners.value.length,
  (count) => {
    if (count > 0) {
      isVictoryModalOpen.value = true
    }
  }
)

const handleRematch = () => {
  resetGame()
  isVictoryModalOpen.value = false
}
</script>

<template>
  <main class="min-h-screen bg-canvas text-neutral-50 px-3 sm:px-6 py-6 flex flex-col items-center justify-between">
    <header class="w-full max-w-7xl flex items-center justify-between pb-4 border-b border-border/50 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
          <HugeiconsIcon
            :icon="Crown02Icon"
            :size="24"
          />
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-black uppercase tracking-wider text-neutral-50">
            Funny Ludo Mania
          </h1>
          <p class="text-xs text-neutral-400">
            খেলুন, গুটি কাটুন, আর ট্রল ডায়লগ উপভোগ করুন!
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="winners.length > 0"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-sm border border-amber-400/80 bg-amber-400/20 text-amber-400 hover:bg-amber-400/30 transition-colors cursor-pointer shadow-sm animate-pulse"
          @click="isVictoryModalOpen = true"
        >
          <HugeiconsIcon
            :icon="Crown02Icon"
            :size="14"
          />
          <span>Podium</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-sm border border-border bg-surface hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
          :class="isMuted ? 'text-rose-400' : 'text-emerald-400'"
          @click="toggleMute"
        >
          <HugeiconsIcon
            :icon="isMuted ? VolumeMute01Icon : VolumeHighIcon"
            :size="14"
          />
          <span>{{ isMuted ? 'Muted' : 'Sound On' }}</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase rounded-sm border border-border bg-surface hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
          @click="resetGame"
        >
          <HugeiconsIcon
            :icon="RefreshIcon"
            :size="14"
          />
          <span>Reset Game</span>
        </button>
      </div>
    </header>

    <div class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div class="lg:col-span-7 xl:col-span-8 flex flex-col items-center w-full">
        <div class="relative w-full flex justify-center">
          <LudoGameBoard
            :players="players"
            :active-player-color="activePlayerColor"
            :can-move-token-ids="canMoveTokenIds"
            :moving-token-id="movingTokenId"
            :destination-map="destinationMap"
            @select-token="selectToken"
          />
          <LudoFloatingTauntOverlay :taunts="activeTaunts" />
        </div>

        <div class="w-full max-w-[720px] mt-4">
          <LudoEmojiTauntPicker @select="handleSendTaunt" />
        </div>
      </div>

      <div class="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 w-full">
        <LudoDiceRoller
          :value="diceValue"
          :rolling="isRolling"
          :active-color="activePlayerColor"
          :can-roll="canRollDice"
          @roll="rollDice"
        />

        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="p in players"
            :key="p.id"
            class="p-2 rounded-sm border transition-all flex flex-col justify-between"
            :class="[
              p.color === activePlayerColor
                ? 'bg-surface border-amber-400 ring-1 ring-amber-400/50'
                : 'bg-surface/50 border-border/40 opacity-70',
            ]"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-extrabold uppercase truncate mr-1">{{ p.name }}</span>
              <button
                type="button"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-sm border transition-colors cursor-pointer"
                :class="[
                  p.isBot
                    ? 'border-indigo-400/60 bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/60'
                    : 'border-emerald-400/60 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60',
                ]"
                @click="togglePlayerBot(p.color)"
              >
                <HugeiconsIcon
                  :icon="p.isBot ? AiGameIcon : User02Icon"
                  :size="11"
                />
                <span>{{ p.isBot ? 'Bot' : 'Human' }}</span>
              </button>
            </div>
            <div class="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
              <span>Goal: {{ p.tokens.filter(t => t.status === 'finished').length }}/4</span>
              <span
                v-if="p.color === activePlayerColor && p.isBot"
                class="text-amber-400 font-semibold animate-pulse"
              >
                Thinking...
              </span>
            </div>
            <div class="flex gap-1">
              <span
                v-for="t in p.tokens"
                :key="t.id"
                class="w-2 h-2 rounded-sm"
                :class="[
                  t.status === 'finished'
                    ? 'bg-emerald-400'
                    : t.status === 'home'
                      ? 'bg-slate-600'
                      : 'bg-amber-400 animate-pulse',
                ]"
              />
            </div>
          </div>
        </div>

        <LudoFunnyChatFeed :messages="history" />
      </div>
    </div>

    <footer class="w-full max-w-5xl pt-6 mt-6 border-t border-border/30 text-center text-xs text-neutral-500">
      Built with Nuxt 4, Vue 3 Composition API & Tailwind CSS • SOLID & Clean Architecture
    </footer>

    <LudoVictoryModal
      :is-open="isVictoryModalOpen"
      :winners="winners"
      :players="players"
      @rematch="handleRematch"
      @close="isVictoryModalOpen = false"
    />
  </main>
</template>
