import type { PlayerColor } from './ludo'
import type { UserProfile } from './user'

export type WsMessageType =
  | 'ROOM_JOIN'
  | 'ROOM_JOINED'
  | 'ROOM_STATE'
  | 'CLAIM_SLOT'
  | 'PLAYER_ACTION_ROLL'
  | 'PLAYER_ACTION_MOVE'
  | 'PLAYER_TAUNT'
  | 'GAME_RESET'
  | 'CHAT_MESSAGE'

export interface WsMessagePayload {
  type: WsMessageType
  roomCode: string
  senderId: string
  senderName: string
  data?: any
  timestamp?: number
}

export interface RoomOccupant {
  profile: UserProfile
  assignedColor?: PlayerColor
  isHost: boolean
  lastSeen: number
}

export interface WsRoomData {
  roomCode: string
  hostId: string
  occupants: Record<string, RoomOccupant>
  assignedColors: Record<PlayerColor, string | null> // playerColor -> userId
}
