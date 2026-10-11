<script setup lang="ts">
import type { BoardCell, BoardCoordinate, Player, PlayerColor, Token } from '~/types/ludo'
import { coordKey, getBoardGrid } from '~/utils/ludoBoard'

const props = defineProps<{
  players: Player[]
  activePlayerColor: PlayerColor
  canMoveTokenIds: string[]
  movingTokenId?: string | null
}>()

const emit = defineEmits<{
  (e: 'selectToken', token: Token): void
}>()

const grid = computed<BoardCell[][]>(() => getBoardGrid())

const pathTokensMap = computed<Map<string, Token[]>>(() => {
  const map = new Map<string, Token[]>()
  for (const player of props.players) {
    for (const token of player.tokens) {
      if (token.status === 'path' || token.status === 'goal_track') {
        const key = coordKey(token.position.row, token.position.col)
        const list = map.get(key) || []
        list.push(token)
        map.set(key, list)
      }
    }
  }
  return map
})

const getTokensAtCell = (row: number, col: number): Token[] => {
  return pathTokensMap.value.get(coordKey(row, col)) || []
}

const getPlayer = (color: PlayerColor): Player => {
  return props.players.find(p => p.color === color) || {
    id: color,
    name: color.toUpperCase(),
    color,
    isBot: false,
    avatar: '',
    tokens: [],
    hasFinished: false,
  }
}

const finishedCounts = computed<Record<PlayerColor, number>>(() => {
  const counts: Record<PlayerColor, number> = { red: 0, green: 0, yellow: 0, blue: 0 }
  for (const p of props.players) {
    counts[p.color] = p.tokens.filter(t => t.status === 'finished').length
  }
  return counts
})
</script>

<template>
  <div class="relative w-full max-w-[560px] aspect-square mx-auto p-2 bg-canvas rounded-sm border-2 border-border shadow-2xl">
    <div class="grid grid-cols-15 grid-rows-15 w-full h-full gap-[1px] bg-border/20 rounded-sm overflow-hidden">
      <!-- Red Home Base (Rows 1-6, Cols 1-6) -->
      <div class="col-start-1 col-end-7 row-start-1 row-end-7 z-10">
        <LudoHomeBase
          color="red"
          :player-name="getPlayer('red').name"
          :tokens="getPlayer('red').tokens"
          :active-player-color="activePlayerColor"
          :can-move-token-ids="canMoveTokenIds"
          @select-token="emit('selectToken', $event)"
        />
      </div>

      <!-- Green Home Base (Rows 1-6, Cols 10-15) -->
      <div class="col-start-10 col-end-16 row-start-1 row-end-7 z-10">
        <LudoHomeBase
          color="green"
          :player-name="getPlayer('green').name"
          :tokens="getPlayer('green').tokens"
          :active-player-color="activePlayerColor"
          :can-move-token-ids="canMoveTokenIds"
          @select-token="emit('selectToken', $event)"
        />
      </div>

      <!-- Yellow Home Base (Rows 10-15, Cols 10-15) -->
      <div class="col-start-10 col-end-16 row-start-10 row-end-16 z-10">
        <LudoHomeBase
          color="yellow"
          :player-name="getPlayer('yellow').name"
          :tokens="getPlayer('yellow').tokens"
          :active-player-color="activePlayerColor"
          :can-move-token-ids="canMoveTokenIds"
          @select-token="emit('selectToken', $event)"
        />
      </div>

      <!-- Blue Home Base (Rows 10-15, Cols 1-6) -->
      <div class="col-start-1 col-end-7 row-start-10 row-end-16 z-10">
        <LudoHomeBase
          color="blue"
          :player-name="getPlayer('blue').name"
          :tokens="getPlayer('blue').tokens"
          :active-player-color="activePlayerColor"
          :can-move-token-ids="canMoveTokenIds"
          @select-token="emit('selectToken', $event)"
        />
      </div>

      <!-- Center Goal (Rows 7-9, Cols 7-9) -->
      <div class="col-start-7 col-end-10 row-start-7 row-end-10 z-10">
        <LudoCenterGoal :finished-counts="finishedCounts" />
      </div>

      <!-- Path Cells -->
      <template v-for="r in 15" :key="`row-${r - 1}`">
        <template v-for="c in 15" :key="`cell-${r - 1}-${c - 1}`">
          <div
            v-if="grid[r - 1][c - 1].type !== 'base' && grid[r - 1][c - 1].type !== 'center'"
            :style="{
              gridRowStart: r,
              gridRowEnd: r + 1,
              gridColumnStart: c,
              gridColumnEnd: c + 1,
            }"
            class="relative w-full h-full"
          >
            <LudoBoardCell :cell="grid[r - 1][c - 1]">
              <div
                v-if="getTokensAtCell(r - 1, c - 1).length > 0"
                class="flex items-center justify-center -space-x-1"
              >
                <LudoTokenPiece
                  v-for="tok in getTokensAtCell(r - 1, c - 1)"
                  :key="tok.id"
                  :token="tok"
                  :can-move="canMoveTokenIds.includes(tok.id)"
                  :is-moving="movingTokenId === tok.id"
                  :size="getTokensAtCell(r - 1, c - 1).length > 1 ? 'sm' : 'md'"
                  @select="emit('selectToken', $event)"
                />
              </div>
            </LudoBoardCell>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
