export interface UserProfile {
  id: string
  name: string
  avatar: string
  createdAt: number
}

export interface RoomSession {
  code: string
  hostId: string
  hostName: string
  isHost: boolean
  joinedAt: number
}

