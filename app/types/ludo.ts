export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue'

export type TokenStatus = 'home' | 'path' | 'goal_track' | 'finished'

export interface BoardCoordinate {
  row: number
  col: number
}

export interface Token {
  id: string
  color: PlayerColor
  index: number
  status: TokenStatus
  step: number
  position: BoardCoordinate
}

export interface Player {
  id: string
  name: string
  color: PlayerColor
  isBot: boolean
  avatar: string
  tokens: Token[]
  hasFinished: boolean
  rank?: number
}

export type CellType = 'common' | 'safe' | 'home_run' | 'center' | 'base'

export interface BoardCell {
  id: string
  row: number
  col: number
  type: CellType
  color?: PlayerColor
  isStar?: boolean
}

export type GamePhase = 'idle' | 'rolling' | 'select_token' | 'moving' | 'game_over'

export interface FunnyMessage {
  id: string
  sender: string
  color: PlayerColor
  text: string
  timestamp: number
  soundKey?: string
}

export interface MoveResult {
  valid: boolean
  token: Token
  from: BoardCoordinate
  to: BoardCoordinate
  capturedTokens: Token[]
  reachedGoal: boolean
  extraTurn: boolean
  funnyEvent?: FunnyMessage
}

export interface GameState {
  players: Player[]
  activePlayerColor: PlayerColor
  diceValue: number | null
  diceRolling: boolean
  phase: GamePhase
  consecutiveSixes: number
  winners: PlayerColor[]
  history: FunnyMessage[]
  selectedTokenId: string | null
}

