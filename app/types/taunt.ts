import type { PlayerColor } from '~/types/ludo'

export interface EmojiTauntItem {
  id: string
  emoji: string
  label: string
  soundTone: number
}

export interface ActiveTaunt {
  id: string
  emoji: string
  label: string
  senderColor: PlayerColor
  senderName: string
  x: number
  y: number
}
