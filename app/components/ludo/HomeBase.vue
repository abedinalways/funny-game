<script setup lang="ts">
import type { PlayerColor, Token } from '~/types/ludo'

const props = defineProps<{
  color: PlayerColor
  playerName: string
  tokens: Token[]
  activePlayerColor: PlayerColor
  canMoveTokenIds: string[]
}>()

const emit = defineEmits<{
  (e: 'selectToken', token: Token): void
}>()

const baseBgStyles: Record<PlayerColor, { bg: string; border: string; accent: string }> = {
  red: {
    bg: 'bg-ludo-red/15',
    border: 'border-ludo-red',
    accent: 'bg-ludo-red text-white',
  },
  green: {
    bg: 'bg-ludo-green/15',
    border: 'border-ludo-green',
    accent: 'bg-ludo-green text-white',
  },
  yellow: {
    bg: 'bg-ludo-yellow/15',
    border: 'border-ludo-yellow',
    accent: 'bg-ludo-yellow text-slate-900',
  },
  blue: {
    bg: 'bg-ludo-blue/15',
    border: 'border-ludo-blue',
    accent: 'bg-ludo-blue text-white',
  },
}

const isMyTurn = computed(() => props.activePlayerColor === props.color)

const getSlotToken = (index: number): Token | undefined => {
  return props.tokens.find(t => t.index === index && t.status === 'home')
}
</script>

<template>
  <div
    class="w-full h-full p-2 rounded-sm border-2 flex flex-col justify-between transition-all duration-300"
    :class="[
      baseBgStyles[color].bg,
      baseBgStyles[color].border,
      isMyTurn ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900' : '',
    ]"
  >
    <div class="flex items-center justify-between px-1">
      <span
        class="text-[11px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm shadow-sm"
        :class="baseBgStyles[color].accent"
      >
        {{ playerName }}
      </span>
      <span
        v-if="isMyTurn"
        class="text-[10px] font-semibold text-amber-400 animate-pulse"
      >
        Turn
      </span>
    </div>

    <div class="grid grid-cols-2 gap-2 p-2 bg-slate-950/70 rounded-sm border border-border/40 my-auto mx-auto aspect-square w-3/4 max-w-[120px]">
      <div
        v-for="index in 4"
        :key="index - 1"
        class="aspect-square rounded-sm border border-border/60 bg-surface/80 flex items-center justify-center p-1"
      >
        <template v-if="getSlotToken(index - 1)">
          <LudoTokenPiece
            :token="getSlotToken(index - 1)!"
            :can-move="canMoveTokenIds.includes(getSlotToken(index - 1)!.id)"
            size="sm"
            @select="emit('selectToken', $event)"
          />
        </template>
        <div
          v-else
          class="w-2.5 h-2.5 rounded-sm bg-border/40"
        />
      </div>
    </div>
  </div>
</template>
