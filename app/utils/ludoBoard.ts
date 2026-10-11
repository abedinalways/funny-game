import type { BoardCell, BoardCoordinate, CellType, PlayerColor, Token } from '~/types/ludo'
import {
  BASE_SLOTS,
  COMMON_PATH,
  HOME_RUN_PATHS,
  SAFE_COORDINATES,
  START_INDEX_MAP,
} from '~/constants/ludoPaths'

export const coordKey = (row: number, col: number): string => `${row},${col}`

export const safeCoordinatesSet = new Set(
  SAFE_COORDINATES.map(c => coordKey(c.row, c.col))
)

const playerPathsCache = new Map<PlayerColor, BoardCoordinate[]>()

export const getPlayerFullPath = (color: PlayerColor): BoardCoordinate[] => {
  const cached = playerPathsCache.get(color)
  if (cached) return cached

  const startIndex = START_INDEX_MAP[color]
  const path: BoardCoordinate[] = []

  for (let i = 0; i < 51; i++) {
    const idx = (startIndex + i) % COMMON_PATH.length
    path.push(COMMON_PATH[idx])
  }

  path.push(...HOME_RUN_PATHS[color])
  playerPathsCache.set(color, path)
  return path
}

export const getBaseSlotCoordinate = (color: PlayerColor, index: number): BoardCoordinate => {
  return BASE_SLOTS[color][index]
}

export const isSafeSquare = (row: number, col: number): boolean => {
  return safeCoordinatesSet.has(coordKey(row, col))
}

const boardGridCache: BoardCell[][] = []

export const getBoardGrid = (): BoardCell[][] => {
  if (boardGridCache.length > 0) return boardGridCache

  for (let r = 0; r < 15; r++) {
    const rowCells: BoardCell[] = []
    for (let c = 0; c < 15; c++) {
      rowCells.push(determineCellType(r, c))
    }
    boardGridCache.push(rowCells)
  }

  return boardGridCache
}

const determineCellType = (row: number, col: number): BoardCell => {
  const id = coordKey(row, col)
  const isStar = isSafeSquare(row, col)

  if (row < 6 && col < 6) {
    return { id, row, col, type: 'base', color: 'red' }
  }
  if (row < 6 && col > 8) {
    return { id, row, col, type: 'base', color: 'green' }
  }
  if (row > 8 && col > 8) {
    return { id, row, col, type: 'base', color: 'yellow' }
  }
  if (row > 8 && col < 6) {
    return { id, row, col, type: 'base', color: 'blue' }
  }

  if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
    return { id, row, col, type: 'center' }
  }

  if (row === 7 && col >= 1 && col <= 5) {
    return { id, row, col, type: 'home_run', color: 'red' }
  }
  if (col === 7 && row >= 1 && row <= 5) {
    return { id, row, col, type: 'home_run', color: 'green' }
  }
  if (row === 7 && col >= 9 && col <= 13) {
    return { id, row, col, type: 'home_run', color: 'yellow' }
  }
  if (col === 7 && row >= 9 && row <= 13) {
    return { id, row, col, type: 'home_run', color: 'blue' }
  }

  if (row === 6 && col === 1) {
    return { id, row, col, type: 'safe', color: 'red', isStar: true }
  }
  if (row === 1 && col === 8) {
    return { id, row, col, type: 'safe', color: 'green', isStar: true }
  }
  if (row === 8 && col === 13) {
    return { id, row, col, type: 'safe', color: 'yellow', isStar: true }
  }
  if (row === 13 && col === 6) {
    return { id, row, col, type: 'safe', color: 'blue', isStar: true }
  }

  return {
    id,
    row,
    col,
    type: isStar ? 'safe' : 'common',
    isStar,
  }
}

export const getTargetCoordinate = (
  token: Token,
  roll: number
): BoardCoordinate | null => {
  const path = getPlayerFullPath(token.color)
  if (token.status === 'home') {
    return roll === 6 ? path[0] : null
  }
  const nextStep = token.step + roll
  if (nextStep <= 56) {
    return path[nextStep]
  }
  return null
}
