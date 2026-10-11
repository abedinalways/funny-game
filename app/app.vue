<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Crown02Icon, RefreshIcon, VolumeHighIcon, VolumeMute01Icon } from '@hugeicons/core-free-icons'

const {
  players,
  activePlayerColor,
  activePlayer,
  diceValue,
  isRolling,
  phase,
  canMoveTokenIds,
  canRollDice,
  movingTokenId,
  winners,
  history,
  isMuted,
  toggleMute,
  rollDice,
  selectToken,
  resetGame,
} = useLudoEngine()
</script>

<template>
  <main class="min-h-screen bg-canvas text-neutral-50 px-3 py-6 flex flex-col items-center justify-between">
    <header class="w-full max-w-5xl flex items-center justify-between pb-4 border-b border-border/50 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-sm bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
          <HugeiconsIcon
            :icon="Crown02Icon"
            :size="22"
          />
        </div>
        <div>
          <h1 class="text-lg md:text-xl font-black uppercase tracking-wider text-neutral-50">
            Funny Ludo Mania
          </h1>
          <p class="text-xs text-neutral-400">
            খেলুন, গুটি কাটুন, আর ট্রল ডায়লগ উপভোগ করুন!
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
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

    <div class="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-7 flex flex-col items-center">
        <LudoGameBoard
          :players="players"
          :active-player-color="activePlayerColor"
          :can-move-token-ids="canMoveTokenIds"
          :moving-token-id="movingTokenId"
          @select-token="selectToken"
        />
      </div>

      <div class="lg:col-span-5 flex flex-col gap-4 w-full">
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
            class="p-2 rounded-sm border transition-all"
            :class="[
              p.color === activePlayerColor
                ? 'bg-surface border-amber-400 ring-1 ring-amber-400/50'
                : 'bg-surface/50 border-border/40 opacity-70',
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase">{{ p.name }}</span>
              <span class="text-[10px] text-neutral-400">
                Home: {{ p.tokens.filter(t => t.status === 'finished').length }}/4
              </span>
            </div>
            <div class="flex gap-1 mt-1.5">
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
  </main>
</template>
