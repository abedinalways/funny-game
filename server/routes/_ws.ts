interface RoomOccupant {
  id: string
  name: string
  avatar: string
  color: string
  isHost: boolean
}

const rooms = new Map<string, {
  hostId: string
  occupants: Map<string, RoomOccupant>
  assignedColors: Record<string, string | null>
}>()

const peerMeta = new WeakMap<any, { roomCode: string; senderId: string }>()

const COLOR_ORDER = ['red', 'green', 'yellow', 'blue'] as const

export default defineWebSocketHandler({
  open(peer) {
    // peer connected
  },
  message(peer, message) {
    try {
      const rawText = message.text()
      const payload = JSON.parse(rawText)
      const { type, roomCode, senderId, senderName, data } = payload

      if (!roomCode || !senderId) return

      let room = rooms.get(roomCode)
      if (!room) {
        room = {
          hostId: senderId,
          occupants: new Map(),
          assignedColors: {
            red: null,
            green: null,
            yellow: null,
            blue: null
          }
        }
        rooms.set(roomCode, room)
      }

      if (type === 'ROOM_JOIN') {
        peer.subscribe(roomCode)
        peerMeta.set(peer, { roomCode, senderId })

        const isHost = room.occupants.size === 0 || room.hostId === senderId
        if (isHost && !room.hostId) {
          room.hostId = senderId
        }

        let assignedColor = COLOR_ORDER.find(c => room!.assignedColors[c] === senderId)

        if (!assignedColor) {
          const available = COLOR_ORDER.find(c => room!.assignedColors[c] === null)
          if (available) {
            room.assignedColors[available] = senderId
            assignedColor = available
          }
        }

        room.occupants.set(senderId, {
          id: senderId,
          name: senderName || 'Player',
          avatar: data?.avatar || '🦁',
          color: assignedColor || 'red',
          isHost: room.hostId === senderId
        })

        const occupantsList = Array.from(room.occupants.values())

        peer.publish(roomCode, JSON.stringify({
          type: 'ROOM_STATE',
          roomCode,
          senderId,
          senderName,
          data: {
            hostId: room.hostId,
            occupants: occupantsList,
            assignedColors: room.assignedColors
          }
        }))

        peer.send(JSON.stringify({
          type: 'ROOM_JOINED',
          roomCode,
          senderId,
          senderName,
          data: {
            hostId: room.hostId,
            assignedColor,
            occupants: occupantsList,
            assignedColors: room.assignedColors
          }
        }))
        return
      }

      if (type === 'CLAIM_SLOT') {
        const { targetColor } = data
        if (targetColor && room.assignedColors[targetColor] === null) {
          COLOR_ORDER.forEach(c => {
            if (room!.assignedColors[c] === senderId) {
              room!.assignedColors[c] = null
            }
          })
          room.assignedColors[targetColor] = senderId

          const occ = room.occupants.get(senderId)
          if (occ) {
            occ.color = targetColor
          }

          const occupantsList = Array.from(room.occupants.values())
          const syncMsg = JSON.stringify({
            type: 'ROOM_STATE',
            roomCode,
            senderId,
            senderName,
            data: {
              hostId: room.hostId,
              occupants: occupantsList,
              assignedColors: room.assignedColors
            }
          })
          peer.publish(roomCode, syncMsg)
          peer.send(syncMsg)
        }
        return
      }

      peer.publish(roomCode, rawText)
    } catch {
      // ignore parse errors
    }
  },
  close(peer) {
    const meta = peerMeta.get(peer)
    if (!meta) return

    const { roomCode, senderId } = meta
    const room = rooms.get(roomCode)
    if (!room) return

    room.occupants.delete(senderId)
    COLOR_ORDER.forEach(c => {
      if (room.assignedColors[c] === senderId) {
        room.assignedColors[c] = null
      }
    })

    if (room.occupants.size === 0) {
      rooms.delete(roomCode)
      return
    }

    if (room.hostId === senderId) {
      const nextHost = room.occupants.values().next().value
      if (nextHost) {
        room.hostId = nextHost.id
        nextHost.isHost = true
      }
    }

    const occupantsList = Array.from(room.occupants.values())
    peer.publish(roomCode, JSON.stringify({
      type: 'ROOM_STATE',
      roomCode,
      senderId: 'SYSTEM',
      senderName: 'SYSTEM',
      data: {
        hostId: room.hostId,
        occupants: occupantsList,
        assignedColors: room.assignedColors
      }
    }))
  }
})

