import type { RoomSession, UserProfile } from '~/types/user'

export const useRoomInvite = (userProfile: Ref<UserProfile>) => {
  const route = useRoute()
  const router = useRouter()

  const currentRoom = ref<RoomSession>({
    code: 'ROOM-1001',
    hostId: userProfile.value.id,
    hostName: userProfile.value.name,
    isHost: true,
    joinedAt: Date.now(),
  })

  const copiedToast = ref(false)

  const generateRoomCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000)
    return `LUDO-${num}`
  }

  const initRoom = () => {
    const queryRoom = route.query.room as string | undefined

    if (queryRoom && queryRoom.trim()) {
      currentRoom.value = {
        code: queryRoom.trim().toUpperCase(),
        hostId: 'HOST-REMOTE',
        hostName: 'রুম হোস্ট',
        isHost: false,
        joinedAt: Date.now(),
      }
    } else {
      currentRoom.value = {
        code: generateRoomCode(),
        hostId: userProfile.value.id,
        hostName: userProfile.value.name,
        isHost: true,
        joinedAt: Date.now(),
      }
    }
  }

  const inviteUrl = computed(() => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}${window.location.pathname}?room=${currentRoom.value.code}`
  })

  const copyInviteLink = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false

    try {
      await navigator.clipboard.writeText(inviteUrl.value)
      copiedToast.value = true
      setTimeout(() => {
        copiedToast.value = false
      }, 2500)
      return true
    } catch {
      return false
    }
  }

  const copyRoomCode = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false

    try {
      await navigator.clipboard.writeText(currentRoom.value.code)
      copiedToast.value = true
      setTimeout(() => {
        copiedToast.value = false
      }, 2500)
      return true
    } catch {
      return false
    }
  }

  const joinRoomByCode = (inputCode: string) => {
    const clean = inputCode.trim().toUpperCase()
    if (!clean) return

    currentRoom.value = {
      code: clean,
      hostId: 'HOST-REMOTE',
      hostName: 'রুম হোস্ট',
      isHost: false,
      joinedAt: Date.now(),
    }

    router.replace({ query: { room: clean } })
  }

  const createNewRoom = () => {
    const newCode = generateRoomCode()
    currentRoom.value = {
      code: newCode,
      hostId: userProfile.value.id,
      hostName: userProfile.value.name,
      isHost: true,
      joinedAt: Date.now(),
    }
    router.replace({ query: { room: newCode } })
  }

  onMounted(() => {
    initRoom()
  })

  return {
    currentRoom,
    inviteUrl,
    copiedToast,
    copyInviteLink,
    copyRoomCode,
    joinRoomByCode,
    createNewRoom,
  }
}
