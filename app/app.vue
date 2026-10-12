<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Crown02Icon, RefreshIcon, VolumeHighIcon, VolumeMute01Icon, AiGameIcon, User02Icon, UserAdd01Icon } from '@hugeicons/core-free-icons'

import type { PlayerColor, Token } from '~/types/ludo'
import type { EmojiTauntItem } from '~/types/taunt'
import { useEmojiTaunts } from '~/composables/useEmojiTaunts'
import { useUserProfile } from '~/composables/useUserProfile'
import { useRoomInvite } from '~/composables/useRoomInvite'
import { useSnakeLudoEngine } from '~/composables/useSnakeLudoEngine'
import { useMultiplayerSync } from '~/composables/useMultiplayerSync'

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

const roomCodeRef = computed(() => currentRoom.value.code)
const {
  isConnected,
  isReconnecting,
  myAssignedColor,
  isHost,
  roomOccupants,
  assignedColors,
  broadcastAction,
  claimSlot,
  onRemoteAction,
} = useMultiplayerSync(profile, roomCodeRef)

watch(
  () => profile.value.name,
  (name) => {
    const assigned = myAssignedColor.value || 'red'
    const player = players.value.find(p => p.color === assigned)
    if (player && name) {
      player.name = name
    }
    if (name) {
      snakeEngine.setPlayerName(assigned, name, profile.value.avatar)
    }
  },
  { immediate: true }
)

watch(
  () => assignedColors.value,
  (slots) => {
    if (!slots) return
    const occupants = roomOccupants.value || []

    ;(Object.keys(slots) as PlayerColor[]).forEach((color) => {
      const occupantId = slots[color]
      const classicPlayer = players.value.find(p => p.color === color)
      const snakePlayer = snakeEngine.state.value.players.find(p => p.color === color)

      if (occupantId) {
        const occ = occupants.find(o => o.id === occupantId)
        const occName = occ?.name || (occupantId === profile.value.id ? profile.value.name : color.toUpperCase())
        const occAvatar = occ?.avatar || '🦁'

        if (classicPlayer) {
          classicPlayer.name = occName
          classicPlayer.isBot = false
        }
        if (snakePlayer) {
          snakePlayer.name = occName
          snakePlayer.avatar = occAvatar
          snakePlayer.isBot = false
        }
      } else {
        if (classicPlayer && color !== myAssignedColor.value) {
          classicPlayer.isBot = true
        }
        if (snakePlayer && color !== myAssignedColor.value) {
          snakePlayer.isBot = true
        }
      }
    })
  },
  { deep: true }
)

const handleLocalRollDice = async () => {
  if (gameMode.value === 'classic') {
    const rolled = await rollDice()
    if (rolled) {
      broadcastAction('PLAYER_ACTION_ROLL', {
        gameMode: 'classic',
        rolledValue: rolled,
        activeColor: activePlayerColor.value,
      })
    }
  } else {
    await snakeEngine.rollDice()
    if (snakeEngine.state.value.diceValue) {
      broadcastAction('PLAYER_ACTION_ROLL', {
        gameMode: 'snake',
        rolledValue: snakeEngine.state.value.diceValue,
        activeColor: snakeEngine.activePlayer.value.color,
      })
    }
  }
}

const handleLocalSelectToken = async (token: Token) => {
  broadcastAction('PLAYER_ACTION_MOVE', {
    tokenId: token.id,
    color: token.color,
  })
  await selectToken(token)
}

const handleLocalResetGame = () => {
  if (gameMode.value === 'classic') {
    resetGame()
  } else {
    snakeEngine.resetGame()
  }
  broadcastAction('GAME_RESET', { gameMode: gameMode.value })
}

onRemoteAction(async (payload) => {
  if (payload.senderId === profile.value.id) return

  if (payload.type === 'PLAYER_ACTION_ROLL') {
    const { rolledValue, gameMode: remoteMode } = payload.data
    if (remoteMode === 'classic') {
      await rollDice(rolledValue)
    } else {
      await snakeEngine.rollDice(rolledValue)
    }
    return
  }

  if (payload.type === 'PLAYER_ACTION_MOVE') {
    const { tokenId, color } = payload.data
    const player = players.value.find(p => p.color === color)
    const token = player?.tokens.find(t => t.id === tokenId)
    if (token) {
      await selectToken(token)
    }
    return
  }

  if (payload.type === 'PLAYER_TAUNT') {
    const { taunt, color, senderName } = payload.data
    triggerTaunt(taunt, color, senderName)
    return
  }

  if (payload.type === 'MODE_CHANGE') {
    const { mode } = payload.data
    if (mode === 'classic' || mode === 'snake') {
      gameMode.value = mode
    }
    return
  }

  if (payload.type === 'GAME_RESET') {
    if (payload.data?.gameMode === 'classic') {
      resetGame()
    } else {
      snakeEngine.resetGame()
    }
    return
  }
})

const handleSwitchGameMode = (mode: 'classic' | 'snake') => {
  gameMode.value = mode
  broadcastAction('MODE_CHANGE', { mode })
}

const isProfileModalOpen = ref(false)
const isInviteModalOpen = ref(false)

const { activeTaunts, triggerTaunt, triggerRandomBotTaunt } = useEmojiTaunts()

const handleSendTaunt = (taunt: EmojiTauntItem) => {
  const currentColor = gameMode.value === 'classic'
    ? activePlayerColor.value
    : snakeEngine.activePlayer.value.color
  const currentName = gameMode.value === 'classic'
    ? activePlayer.value.name
    : snakeEngine.activePlayer.value.name

  triggerTaunt(taunt, currentColor, currentName)

  broadcastAction('PLAYER_TAUNT', {
    taunt,
    color: currentColor,
    senderName: currentName,
  })
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
const isSnakeVictoryModalOpen = ref(false)

watch(
  () => winners.value.length,
  (count) => {
    if (count > 0 && gameMode.value === 'classic') {
      isVictoryModalOpen.value = true
    }
  }
)

watch(
  () => snakeEngine.state.value.winnerQueue.length,
  (count) => {
    if (count > 0 && gameMode.value === 'snake') {
      isSnakeVictoryModalOpen.value = true
    }
  }
)

const handleRematch = () => {
  handleLocalResetGame()
  isVictoryModalOpen.value = false
}

const handleSnakeRematch = () => {
  handleLocalResetGame()
  isSnakeVictoryModalOpen.value = false
}
</script>

<template>
  <main class="min-h-screen bg-canvas text-neutral-50 px-2 sm:px-4 md:px-6 py-3 sm:py-6 flex flex-col items-center justify-between">
    <header class="w-full max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/50 mb-4 sm:mb-6">
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
            @click="handleSwitchGameMode('classic')"
          >
            🎲 ক্লাসিক লুডু
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs font-bold rounded transition"
            :class="gameMode === 'snake' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="handleSwitchGameMode('snake')"
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
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase rounded-sm border transition-colors cursor-pointer shadow-sm"
          :class="isConnected ? 'border-emerald-500/70 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60' : 'border-amber-500/70 bg-amber-950/60 text-amber-300'"
          @click="isInviteModalOpen = true"
        >
          <HugeiconsIcon
            :icon="UserAdd01Icon"
            :size="14"
          />
          <span>Invite ({{ currentRoom.code }})</span>
          <span v-if="isConnected" class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
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
          v-else-if="gameMode === 'snake' && snakeEngine.state.value.winnerQueue.length > 0"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-sm border border-emerald-400/80 bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30 transition-colors cursor-pointer shadow-sm animate-pulse"
          @click="isSnakeVictoryModalOpen = true"
        >
          <HugeiconsIcon
            :icon="Crown02Icon"
            :size="14"
          />
          <span>Snake Podium</span>
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
          @click="handleLocalResetGame"
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
            @select-token="handleLocalSelectToken"
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
          @roll="handleLocalRollDice"
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
          @roll="handleLocalRollDice"
          @reset="handleLocalResetGame"
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

    <SnakeludoSnakeVictoryModal
      :is-open="isSnakeVictoryModalOpen"
      :winner-queue="snakeEngine.state.value.winnerQueue"
      :players="snakeEngine.state.value.players"
      @rematch="handleSnakeRematch"
      @close="isSnakeVictoryModalOpen = false"
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
      :is-connected="isConnected"
      :is-reconnecting="isReconnecting"
      :my-assigned-color="myAssignedColor"
      :room-occupants="roomOccupants"
      :assigned-colors="assignedColors"
      @claim-slot="claimSlot"
      @copy-link="copyInviteLink"
      @copy-code="copyRoomCode"
      @join-room="joinRoomByCode"
      @new-room="createNewRoom"
      @close="isInviteModalOpen = false"
    />
  </main>
</template>
