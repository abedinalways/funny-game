import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { PlayerColor } from '../types/ludo'
import type { UserProfile } from '../types/user'
import type { WsMessagePayload } from '../types/multiplayer'

export function useMultiplayerSync(profile: Ref<UserProfile>, roomCode: Ref<string>) {
  const isConnected = ref(false)
  const isReconnecting = ref(false)
  const myAssignedColor = ref<PlayerColor | null>(null)
  const hostId = ref<string>('')
  const roomOccupants = ref<Array<{ id: string; name: string; avatar: string; color?: PlayerColor; isHost: boolean }>>([])
  const assignedColors = ref<Record<PlayerColor, string | null>>({
    red: null,
    green: null,
    yellow: null,
    blue: null
  })

  let socket: WebSocket | null = null
  let reconnectTimer: any = null

  const isHost = computed(() => hostId.value === profile.value.id)

  const actionHandlers = new Set<(payload: WsMessagePayload) => void>()

  const onRemoteAction = (handler: (payload: WsMessagePayload) => void) => {
    actionHandlers.add(handler)
    return () => actionHandlers.delete(handler)
  }

  const connect = () => {
    if (typeof window === 'undefined') return
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/_ws`

    try {
      socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        isConnected.value = true
        isReconnecting.value = false

        sendRaw({
          type: 'ROOM_JOIN',
          roomCode: roomCode.value,
          senderId: profile.value.id,
          senderName: profile.value.name,
          data: {
            avatar: profile.value.avatar
          }
        })
      }

      socket.onmessage = (event) => {
        try {
          const payload: WsMessagePayload = JSON.parse(event.data)

          if (payload.type === 'ROOM_JOINED') {
            hostId.value = payload.data?.hostId || ''
            if (payload.data?.assignedColor) {
              myAssignedColor.value = payload.data.assignedColor
            }
            if (payload.data?.occupants) {
              roomOccupants.value = payload.data.occupants
            }
            if (payload.data?.assignedColors) {
              assignedColors.value = payload.data.assignedColors
            }
            return
          }

          if (payload.type === 'ROOM_STATE') {
            if (payload.data?.hostId) hostId.value = payload.data.hostId
            if (payload.data?.occupants) roomOccupants.value = payload.data.occupants
            if (payload.data?.assignedColors) {
              assignedColors.value = payload.data.assignedColors
              const found = Object.keys(payload.data.assignedColors).find(
                (c: any) => payload.data.assignedColors[c] === profile.value.id
              ) as PlayerColor | undefined
              if (found) myAssignedColor.value = found
            }
            return
          }

          actionHandlers.forEach(handler => handler(payload))
        } catch {
          // ignore parsing error
        }
      }

      socket.onclose = () => {
        isConnected.value = false
        scheduleReconnect()
      }

      socket.onerror = () => {
        isConnected.value = false
        socket?.close()
      }
    } catch {
      scheduleReconnect()
    }
  }

  const scheduleReconnect = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    isReconnecting.value = true
    reconnectTimer = setTimeout(() => {
      connect()
    }, 2500)
  }

  const sendRaw = (payload: WsMessagePayload) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload))
    }
  }

  const broadcastAction = (type: WsMessagePayload['type'], data?: any) => {
    sendRaw({
      type,
      roomCode: roomCode.value,
      senderId: profile.value.id,
      senderName: profile.value.name,
      data,
      timestamp: Date.now()
    })
  }

  const claimSlot = (color: PlayerColor) => {
    broadcastAction('CLAIM_SLOT', { targetColor: color })
  }

  watch(
    () => roomCode.value,
    () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
      connect()
    }
  )

  watch(
    () => profile.value.id,
    () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        sendRaw({
          type: 'ROOM_JOIN',
          roomCode: roomCode.value,
          senderId: profile.value.id,
          senderName: profile.value.name,
          data: {
            avatar: profile.value.avatar
          }
        })
      }
    }
  )

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (socket) socket.close()
  })

  return {
    isConnected,
    isReconnecting,
    myAssignedColor,
    isHost,
    roomOccupants,
    assignedColors,
    broadcastAction,
    claimSlot,
    onRemoteAction
  }
}

