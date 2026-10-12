<script setup lang="ts">
import type { PlayerColor, Token } from '~/types/ludo'

const props = defineProps<{
  color: PlayerColor
  playerName: string
  tokens: Token[]
  activePlayerColor: PlayerColor
  canMoveTokenIds: string[]
  myColor?: PlayerColor | null
}>()

const emit = defineEmits<{
  (e: 'selectToken', token: Token): void
}>()

const baseBgStyles: Record<PlayerColor, { bg: string; border: string; accent: string; glow: string }> = {
  red: {
    bg: 'bg-red-950/40',
    border: 'border-red-600',
    accent: 'bg-ludo-red text-white shadow-red-900/50',
    glow: 'ring-2 ring-red-400 shadow-[0_0_20px_rgba(239,68,68,0.35)]',
  },
  green: {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-600',
    accent: 'bg-ludo-green text-white shadow-emerald-900/50',
    glow: 'ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.35)]',
  },
  yellow: {
    bg: 'bg-amber-950/40',
    border: 'border-amber-500',
    accent: 'bg-ludo-yellow text-slate-950 shadow-amber-900/50',
    glow: 'ring-2 ring-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.35)]',
  },
  blue: {
    bg: 'bg-blue-950/40',
    border: 'border-blue-600',
    accent: 'bg-ludo-blue text-white shadow-blue-900/50',
    glow: 'ring-2 ring-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.35)]',
  },
}

const isMyCourt = computed(() => props.myColor ? props.color === props.myColor : false)
const isMyTurn = computed(() => props.activePlayerColor === props.color)

const getSlotToken = (index: number): Token | undefined => {
  return props.tokens.find(t => t.index === index && t.status === 'home')
}
</script>

<template>
  <div
    class="w-full h-full p-1 sm:p-2.5 md:p-3 rounded-sm border sm:border-2 flex flex-col justify-between transition-all duration-300 select-none overflow-hidden"
    :class="[
      baseBgStyles[color].bg,
      baseBgStyles[color].border,
      isMyTurn ? `${baseBgStyles[color].glow} ring-offset-1 sm:ring-offset-2 ring-offset-slate-950` : 'opacity-90',
    ]"
  >
    <div class="flex items-center justify-between px-0.5 sm:px-1">
      <div class="flex items-center gap-1 min-w-0">
        <span
          class="text-[9px] sm:text-xs md:text-sm font-black uppercase tracking-wider px-1 sm:px-2 py-0.2 sm:py-0.5 rounded-sm shadow-md truncate max-w-[68px] sm:max-w-[120px]"
          :class="baseBgStyles[color].accent"
        >
          {{ playerName }}
        </span>
        <span
          v-if="isMyCourt"
          class="text-[7px] sm:text-[9px] font-black uppercase bg-white/20 text-white px-1 py-0.2 rounded-sm border border-white/30"
        >
          আপনি
        </span>
      </div>
      <span
        v-if="isMyTurn"
        class="text-[8px] sm:text-[10px] md:text-xs font-black text-amber-300 animate-pulse uppercase tracking-wider bg-amber-400/20 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded-sm border border-amber-400/40"
      >
        Turn
      </span>
    </div>

    <!-- 4 Token Base Slots -->
    <div class="grid grid-cols-2 gap-1 sm:gap-2.5 md:gap-3 p-1 sm:p-2.5 md:p-3 bg-slate-950/80 rounded-sm border sm:border-2 border-border/60 my-auto mx-auto aspect-square w-full sm:w-5/6 max-w-[160px] shadow-inner">
      <div
        v-for="index in 4"
        :key="index - 1"
        class="aspect-square rounded-sm border border-border/80 bg-surface/90 flex items-center justify-center p-0.5 sm:p-1 shadow-sm transition-transform"
      >
        <template v-if="getSlotToken(index - 1)">
          <LudoTokenPiece
            :token="getSlotToken(index - 1)!"
            :can-move="canMoveTokenIds.includes(getSlotToken(index - 1)!.id)"
            size="md"
            @select="emit('selectToken', $event)"
          />
        </template>
        <div
          v-else
          class="w-2 h-2 sm:w-3.5 sm:h-3.5 rounded-sm bg-border/40"
        />
      </div>
    </div>
  </div>
</template>
