<script setup lang="ts">
import { ref, watch } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Crown02Icon, RefreshIcon, VolumeHighIcon, VolumeMute01Icon, AiGameIcon, User02Icon, UserAdd01Icon } from '@hugeicons/core-free-icons'

import type { EmojiTauntItem } from '~/types/taunt'
import { useEmojiTaunts } from '~/composables/useEmojiTaunts'
import { useUserProfile } from '~/composables/useUserProfile'
import { useRoomInvite } from '~/composables/useRoomInvite'
import { useSnakeLudoEngine } from '~/composables/useSnakeLudoEngine'

const gameMode = ref<'classic' | 'snake'>('classic')

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

const snakeEngine = useSnakeLudoEngine()

const { profile, availableAvatars, updateName, updateAvatar } = useUserProfile()
const {
  currentRoom,
  inviteUrl,
  copiedToast,
  copyInviteLink,
  copyRoomCode,
  joinRoomByCode,
  createNewRoom,
} = useRoomInvite(profile)

watch(
  () => profile.value.name,
  (name) => {
    const red = players.value.find(p => p.color === 'red')
    if (red && name) {
      red.name = name
    }
    if (name) {
      snakeEngine.setPlayerName('red', name, profile.value.avatar)
    }
  },
  { immediate: true }
)

const isProfileModalOpen = ref(false)
const isInviteModalOpen = ref(false)

const { activeTaunts, triggerTaunt, triggerRandomBotTaunt } = useEmojiTaunts()

const handleSendTaunt = (taunt: EmojiTauntItem) => {
  if (gameMode.value === 'classic') {
    triggerTaunt(taunt, activePlayerColor.value, activePlayer.value.name)
  } else {
    triggerTaunt(taunt, snakeEngine.activePlayer.value.color, snakeEngine.activePlayer.value.name)
  }
}

watch(
  () => history.value[0],
  (latest) => {
    if (latest && gameMode.value === 'classic') {
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
    if (count > 0 && gameMode.value === 'classic') {
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
    <header class="w-full max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/50 mb-6">
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

      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex items-center bg-slate-900 border border-slate-700 p-1 rounded-lg">
          <button
            type="button"
            class="px-3 py-1 text-xs font-bold rounded transition"
            :class="gameMode === 'classic' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="gameMode = 'classic'"
          >
            🎲 ক্লাসিক লুডু
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs font-bold rounded transition"
            :class="gameMode === 'snake' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="gameMode = 'snake'"
          >
            🐍 সাপ-লুডু (Snakes)
          </button>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-sm border border-border bg-slate-900/90 hover:bg-slate-800 text-neutral-200 transition-colors cursor-pointer shadow-sm"
          @click="isProfileModalOpen = true"
        >
          <span class="text-sm">{{ profile.avatar }}</span>
          <span class="truncate max-w-[100px]">{{ profile.name }}</span>
          <span class="text-[9px] font-mono text-neutral-400">({{ profile.id }})</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase rounded-sm border border-emerald-500/70 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer shadow-sm"
          @click="isInviteModalOpen = true"
        >
          <HugeiconsIcon
            :icon="UserAdd01Icon"
            :size="14"
          />
          <span>Invite ({{ currentRoom.code }})</span>
        </button>

        <button
          v-if="gameMode === 'classic' && winners.length > 0"
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
          @click="gameMode === 'classic' ? resetGame() : snakeEngine.resetGame()"
        >
          <HugeiconsIcon
            :icon="RefreshIcon"
            :size="14"
          />
          <span>Reset Game</span>
        </button>
      </div>
    </header>

    <div v-if="gameMode === 'classic'" class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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

    <div v-else class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div class="lg:col-span-7 xl:col-span-8 flex flex-col items-center w-full">
        <div class="relative w-full flex justify-center">
          <SnakeludoSnakeBoard
            :players="snakeEngine.state.value.players"
            :active-player="snakeEngine.activePlayer.value"
          />
          <LudoFloatingTauntOverlay :taunts="activeTaunts" />
        </div>

        <div class="w-full max-w-[720px] mt-4">
          <LudoEmojiTauntPicker @select="handleSendTaunt" />
        </div>
      </div>

      <div class="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 w-full items-center lg:items-start">
        <SnakeludoSnakeControlPanel
          :players="snakeEngine.state.value.players"
          :active-player="snakeEngine.activePlayer.value"
          :dice-value="snakeEngine.state.value.diceValue"
          :is-rolling="snakeEngine.state.value.isRolling"
          :is-game-over="snakeEngine.state.value.isGameOver"
          :history="snakeEngine.state.value.history"
          @roll="snakeEngine.rollDice"
          @reset="snakeEngine.resetGame"
          @toggle-bot="snakeEngine.toggleBot"
        />
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

    <LudoUserProfileModal
      :is-open="isProfileModalOpen"
      :profile="profile"
      :available-avatars="availableAvatars"
      @save-name="updateName"
      @save-avatar="updateAvatar"
      @close="isProfileModalOpen = false"
    />

    <LudoRoomInviteModal
      :is-open="isInviteModalOpen"
      :room="currentRoom"
      :invite-url="inviteUrl"
      :copied-toast="copiedToast"
      :profile="profile"
      @copy-link="copyInviteLink"
      @copy-code="copyRoomCode"
      @join-room="joinRoomByCode"
      @new-room="createNewRoom"
      @close="isInviteModalOpen = false"
    />
  </main>
</template>
