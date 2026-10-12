<template>
  <div class="relative w-full max-w-[720px] aspect-square select-none rounded-2xl bg-slate-950 border-4 border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden">
    <!-- SVG Overlay for realistic curved snakes and rigid ladders -->
    <svg class="absolute inset-2.5 sm:inset-4 w-[calc(100%-20px)] sm:w-[calc(100%-32px)] h-[calc(100%-20px)] sm:h-[calc(100%-32px)] pointer-events-none z-10" viewBox="0 0 1000 1000">
      <defs>
        <!-- Ladder step pattern / marker -->
        <filter id="glow-snake" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
        <linearGradient id="ladder-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="100%" stop-color="#b45309" />
        </linearGradient>
        <linearGradient id="snake-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="100%" stop-color="#7f1d1d" />
        </linearGradient>
        <linearGradient id="snake-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#84cc16" />
          <stop offset="100%" stop-color="#14532d" />
        </linearGradient>
      </defs>

      <!-- Draw Ladders -->
      <g v-for="ladder in ladderCurves" :key="ladder.id" class="opacity-90">
        <!-- Left rail -->
        <line
          :x1="ladder.x1 - ladder.offset"
          :y1="ladder.y1 + ladder.offset"
          :x2="ladder.x2 - ladder.offset"
          :y2="ladder.y2 + ladder.offset"
          stroke="url(#ladder-grad)"
          stroke-width="7"
          stroke-linecap="round"
          filter="url(#glow-snake)"
        />
        <!-- Right rail -->
        <line
          :x1="ladder.x1 + ladder.offset"
          :y1="ladder.y1 - ladder.offset"
          :x2="ladder.x2 + ladder.offset"
          :y2="ladder.y2 - ladder.offset"
          stroke="url(#ladder-grad)"
          stroke-width="7"
          stroke-linecap="round"
          filter="url(#glow-snake)"
        />
        <!-- Rungs -->
        <line
          v-for="(rung, idx) in ladder.rungs"
          :key="idx"
          :x1="rung.x1"
          :y1="rung.y1"
          :x2="rung.x2"
          :y2="rung.y2"
          stroke="#fef08a"
          stroke-width="4"
          stroke-linecap="round"
        />
      </g>

      <!-- Draw Snakes -->
      <g v-for="(snake, idx) in snakeCurves" :key="snake.id" filter="url(#glow-snake)">
        <!-- Snake Body with organic wavy curve -->
        <path
          :d="snake.path"
          fill="none"
          :stroke="idx % 2 === 0 ? 'url(#snake-grad-1)' : 'url(#snake-grad-2)'"
          stroke-width="12"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          :d="snake.path"
          fill="none"
          stroke="#fef08a"
          stroke-width="2.5"
          stroke-dasharray="6 6"
          opacity="0.8"
        />
        <!-- Snake Head Circle / Marker -->
        <circle :cx="snake.headX" :cy="snake.headY" r="13" :fill="idx % 2 === 0 ? '#b91c1c' : '#15803d'" stroke="#ffffff" stroke-width="2" />
        <text :x="snake.headX" :y="snake.headY + 5" font-size="14" text-anchor="middle" dominant-baseline="central">🐍</text>
        <!-- Snake Tail Marker -->
        <circle :cx="snake.tailX" :cy="snake.tailY" r="5" fill="#f59e0b" />
      </g>
    </svg>

    <!-- 10x10 Matrix Board Grid -->
    <div class="grid grid-cols-10 grid-rows-10 gap-1 w-full h-full relative z-0">
      <div
        v-for="cell in cells"
        :key="cell.number"
        class="relative rounded-md flex flex-col justify-between p-1 border transition-all duration-200"
        :class="getCellBgClass(cell)"
      >
        <div class="w-full flex items-center justify-between leading-none">
          <span
            class="font-black font-mono text-[10px] sm:text-xs tracking-tight"
            :class="cell.number === 100 ? 'text-amber-300 font-extrabold text-sm' : 'text-slate-300'"
          >
            {{ cell.number }}
          </span>
          <span v-if="cell.number === 100" class="text-xs sm:text-sm">🏆</span>
          <span v-else-if="cell.encounter" class="text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-extrabold"
                :class="cell.encounter.type === 'snake' ? 'bg-red-500/30 text-red-300' : 'bg-emerald-500/30 text-emerald-300'">
            {{ cell.encounter.type === 'snake' ? '↓' + cell.encounter.end : '↑' + cell.encounter.end }}
          </span>
        </div>

        <div class="w-full text-center">
          <span v-if="cell.encounter" class="text-[8px] font-bold truncate block px-0.5 opacity-80"
                :class="cell.encounter.type === 'snake' ? 'text-rose-300' : 'text-emerald-300'">
            {{ cell.encounter.name }}
          </span>
        </div>

        <!-- Player Tokens on Cell -->
        <div class="flex items-center justify-center gap-1 min-h-[20px] sm:min-h-[26px] flex-wrap z-20">
          <div
            v-for="p in getPlayersAtCell(cell.number)"
            :key="p.id"
            class="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all transform hover:scale-125"
            :class="getPlayerBadgeColor(p.color)"
            :title="`${p.name} (ঘর: ${cell.number})`"
          >
            <span class="text-xs sm:text-sm leading-none drop-shadow">{{ p.avatar }}</span>
            <span
              v-if="p.id === activePlayer.color"
              class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-ping"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Start / Waiting Zone (0) -->
    <div class="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 bg-slate-900/90 px-3 py-2 rounded-xl z-20">
      <div class="flex items-center gap-1.5 font-bold text-slate-400">
        <span>🚩 শুরুর ঘর (০):</span>
        <span class="text-[10px] text-slate-500 font-normal">লুডুর ডাইস রোল করে এগিয়ে চলুন</span>
      </div>
      <div class="flex items-center gap-2">
        <div
          v-for="p in waitingPlayers"
          :key="p.id"
          class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs shadow-sm"
        >
          <span>{{ p.avatar }}</span>
          <span class="font-extrabold text-[11px]" :class="getTextColorClass(p.color)">{{ p.name }}</span>
        </div>
        <span v-if="waitingPlayers.length === 0" class="text-xs text-emerald-400 font-medium">সবাই বোর্ডে আছে! 🎯</span>
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
      result.push({ number: num, row, col: actualCol, encounter })
    }
  }
  return result
})

const getCellCenter = (num: number) => {
  const rowFromBottom = Math.floor((num - 1) / 10)
  const isEvenRow = rowFromBottom % 2 === 0
  const colIndex = (num - 1) % 10
  const actualCol = isEvenRow ? colIndex : (9 - colIndex)
  const actualRow = 9 - rowFromBottom

  const x = actualCol * 100 + 50
  const y = actualRow * 100 + 50
  return { x, y }
}

const snakeCurves = computed(() => {
  return SNAKES_AND_LADDERS
    .filter(item => item.type === 'snake')
    .map(snake => {
      const startPos = getCellCenter(snake.start)
      const endPos = getCellCenter(snake.end)

      const midX = (startPos.x + endPos.x) / 2 + (startPos.x > endPos.x ? 35 : -35)
      const midY = (startPos.y + endPos.y) / 2 + 20

      return {
        id: snake.id,
        headX: startPos.x,
        headY: startPos.y,
        tailX: endPos.x,
        tailY: endPos.y,
        path: `M ${startPos.x} ${startPos.y} Q ${midX} ${midY} ${endPos.x} ${endPos.y}`
      }
    })
})

const ladderCurves = computed(() => {
  return SNAKES_AND_LADDERS
    .filter(item => item.type === 'ladder')
    .map(ladder => {
      const startPos = getCellCenter(ladder.start)
      const endPos = getCellCenter(ladder.end)

      const dx = endPos.x - startPos.x
      const dy = endPos.y - startPos.y
      const len = Math.hypot(dx, dy)
      const ux = -dy / len
      const uy = dx / len
      const offset = 8

      const rungs = []
      const numRungs = Math.max(3, Math.floor(len / 45))
      for (let i = 1; i < numRungs; i++) {
        const t = i / numRungs
        const rx = startPos.x + dx * t
        const ry = startPos.y + dy * t
        rungs.push({
          x1: rx - ux * offset,
          y1: ry - uy * offset,
          x2: rx + ux * offset,
          y2: ry + uy * offset
        })
      }

      return {
        id: ladder.id,
        x1: startPos.x,
        y1: startPos.y,
        x2: endPos.x,
        y2: endPos.y,
        offset,
        rungs
      }
    })
})

const waitingPlayers = computed(() => {
  return props.players.filter(p => p.position === 0)
})

const getPlayersAtCell = (pos: number) => {
  return props.players.filter(p => p.position === pos)
}

const getCellBgClass = (cell: CellData) => {
  if (cell.number === 100) {
    return 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] font-black'
  }
  if (cell.encounter?.type === 'snake') {
    return 'bg-red-950/40 border-red-800/60 hover:bg-red-900/50'
  }
  if (cell.encounter?.type === 'ladder') {
    return 'bg-emerald-950/40 border-emerald-800/60 hover:bg-emerald-900/50'
  }

  const isAlt = (cell.row + cell.col) % 2 === 0
  return isAlt
    ? 'bg-slate-900/90 border-slate-800/80'
    : 'bg-slate-850/80 border-slate-800/50'
}

const getPlayerBadgeColor = (color: PlayerColor) => {
  switch (color) {
    case 'red': return 'bg-gradient-to-br from-red-400 to-rose-700'
    case 'green': return 'bg-gradient-to-br from-emerald-400 to-green-700'
    case 'yellow': return 'bg-gradient-to-br from-amber-300 to-yellow-600'
    case 'blue': return 'bg-gradient-to-br from-sky-400 to-blue-700'
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
