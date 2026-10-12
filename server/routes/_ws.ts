interface WsSessionData {
  roomCode?: string
  userId?: string
  userName?: string
  userAvatar?: string
}

const rooms = new Map<string, {
  hostId: string
  occupants: Map<string, { id: string; name: string; avatar: string; color?: string; isHost: boolean }>
  assignedColors: Record<string, string | null>
}>()

export default defineWebSocketHandler({
  open(peer) {
    // peer connected
  },
  message(peer, message) {
    try {
      const rawText = message.text()
      const payload = JSON.parse(rawText)
      const { type, roomCode, senderId, senderName, data } = payload

      if (!roomCode) return

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

        const isHost = room.occupants.size === 0 || room.hostId === senderId
        if (isHost) room.hostId = senderId

        let assignedColor = Object.keys(room.assignedColors).find(
          c => room.assignedColors[c] === senderId
        )

        if (!assignedColor) {
          const available = Object.keys(room.assignedColors).find(
            c => room.assignedColors[c] === null
          )
          if (available) {
            room.assignedColors[available] = senderId
            assignedColor = available
          }
        }

        room.occupants.set(senderId, {
          id: senderId,
          name: senderName,
          avatar: data?.avatar || '🦁',
          color: assignedColor,
          isHost
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
          Object.keys(room.assignedColors).forEach(c => {
            if (room.assignedColors[c] === senderId) {
              room.assignedColors[c] = null
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
    // peer disconnected
  }
})
