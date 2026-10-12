<template>
  <div class="relative w-full max-w-[720px] aspect-square select-none rounded-xl bg-slate-900/90 border-4 border-slate-700/80 shadow-2xl p-3 sm:p-4 flex flex-col justify-between">
    <div class="grid grid-cols-10 grid-rows-10 gap-1 sm:gap-1.5 w-full h-full relative">
      <div
        v-for="cell in cells"
        :key="cell.number"
        class="relative rounded flex flex-col items-center justify-between p-0.5 sm:p-1 border text-[10px] sm:text-xs font-bold transition-all duration-300"
        :class="getCellBgClass(cell)"
      >
        <div class="w-full flex items-center justify-between leading-none">
          <span class="opacity-75 font-mono text-[9px] sm:text-[11px]">{{ cell.number }}</span>
          <span v-if="cell.encounter" class="text-[10px] sm:text-sm leading-none drop-shadow">
            {{ cell.encounter.type === 'snake' ? '🐍' : '🪜' }}
          </span>
        </div>

        <div v-if="cell.encounter" class="text-[8px] sm:text-[9px] font-semibold text-center leading-tight truncate max-w-full px-0.5"
             :class="cell.encounter.type === 'snake' ? 'text-red-200' : 'text-emerald-200'">
          {{ cell.encounter.type === 'snake' ? '↓' + cell.encounter.end : '↑' + cell.encounter.end }}
        </div>

        <div class="flex items-center justify-center gap-1 min-h-[18px] sm:min-h-[22px] flex-wrap z-10">
          <div
            v-for="p in getPlayersAtCell(cell.number)"
            :key="p.id"
            class="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md text-[10px] sm:text-xs border border-white/80 animate-bounce transition-transform"
            :class="getPlayerBadgeColor(p.color)"
            :title="p.name"
          >
            {{ p.avatar }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="waitingPlayers.length > 0" class="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg">
      <span class="font-medium text-slate-400">শুরুর ঘর (০):</span>
      <div class="flex items-center gap-2">
        <div
          v-for="p in waitingPlayers"
          :key="p.id"
          class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-700/80 border border-slate-600 text-xs"
        >
          <span>{{ p.avatar }}</span>
          <span class="font-medium" :class="getTextColorClass(p.color)">{{ p.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerColor } from '~/types/ludo'
import type { SnakePlayer, SnakeOrLadder } from '~/types/snakeLudo'
import { SNAKES_AND_LADDERS } from '~/constants/snakeLudo'

const props = defineProps<{
  players: SnakePlayer[]
  activePlayer: SnakePlayer
}>()

interface CellData {
  number: number
  row: number
  col: number
  encounter: SnakeOrLadder | null
}

const cells = computed<CellData[]>(() => {
  const result: CellData[] = []

  for (let row = 9; row >= 0; row--) {
    const isEvenRowFromBottom = (9 - row) % 2 === 0

    for (let col = 0; col < 10; col++) {
      const actualCol = isEvenRowFromBottom ? col : (9 - col)
      const num = (9 - row) * 10 + actualCol + 1
      const encounter = SNAKES_AND_LADDERS.find(item => item.start === num) || null

      result.push({
        number: num,
        row,
        col,
        encounter
      })
    }
  }

  return result
})

const waitingPlayers = computed(() => {
  return props.players.filter(p => p.position === 0)
})

const getPlayersAtCell = (pos: number) => {
  return props.players.filter(p => p.position === pos)
}

const getCellBgClass = (cell: CellData) => {
  if (cell.number === 100) {
    return 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-900 border-amber-300 shadow-amber-500/20 shadow-lg'
  }
  if (cell.encounter?.type === 'snake') {
    return 'bg-red-950/70 border-red-700/60 text-red-100 hover:bg-red-900/80'
  }
  if (cell.encounter?.type === 'ladder') {
    return 'bg-emerald-950/70 border-emerald-700/60 text-emerald-100 hover:bg-emerald-900/80'
  }

  const isAlt = (cell.row + cell.col) % 2 === 0
  return isAlt
    ? 'bg-slate-800/80 border-slate-700/70 text-slate-200'
    : 'bg-slate-850/80 border-slate-700/40 text-slate-300'
}

const getPlayerBadgeColor = (color: PlayerColor) => {
  switch (color) {
    case 'red': return 'bg-rose-500'
    case 'green': return 'bg-emerald-500'
    case 'yellow': return 'bg-amber-400'
    case 'blue': return 'bg-sky-500'
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
</script>
