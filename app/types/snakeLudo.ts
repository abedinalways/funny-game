import type { PlayerColor } from './ludo'

export interface SnakeOrLadder {
  id: string
  start: number
  end: number
  type: 'snake' | 'ladder'
  name: string
  trollMessage: string
}

export interface SnakePlayer {
  id: PlayerColor
  name: string
  avatar: string
  color: PlayerColor
  position: number
  isBot: boolean
  hasWon: boolean
  rank?: number
}

export interface SnakeHistoryMessage {
  id: string
  sender: string
  color: PlayerColor
  text: string
  type: 'snake' | 'ladder' | 'six' | 'move' | 'win' | 'penalty'
}

export interface SnakeLudoState {
  players: SnakePlayer[]
  activePlayerIndex: number
  diceValue: number | null
  isRolling: boolean
  winnerQueue: PlayerColor[]
  isGameOver: boolean
  lastEventMessage: string | null
  lastEventType: 'snake' | 'ladder' | 'six' | 'move' | null
  history: SnakeHistoryMessage[]
}
