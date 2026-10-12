import type { UserProfile } from '~/types/user'

const STORAGE_KEY = 'ludo_user_profile_v1'

const FUNNY_NAMES = [
  'তুফানি বাঘ',
  'লুডুর ওস্তাদ',
  'ছক্কার রাজা',
  'বিচ্ছু প্লেয়ার',
  'গোলমালের বস',
  'ঝড়ো খোকন',
  'চ্যাম্পিয়ন বল্টু',
]

const FUNNY_AVATARS = ['🐯', '👑', '🎲', '🚀', '🦁', '⚡', '🔥']

export const useUserProfile = () => {
  const profile = ref<UserProfile>({
    id: `USR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    name: 'প্লেয়ার ১',
    avatar: '👑',
    createdAt: Date.now(),
  })

  const isLoaded = ref(false)

  const generateRandomProfile = (): UserProfile => {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
    const nameIdx = Math.floor(Math.random() * FUNNY_NAMES.length)
    const avatarIdx = Math.floor(Math.random() * FUNNY_AVATARS.length)

    return {
      id: `USR-${randomSuffix}`,
      name: FUNNY_NAMES[nameIdx],
      avatar: FUNNY_AVATARS[avatarIdx],
      createdAt: Date.now(),
    }
  }

  const loadProfile = () => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        profile.value = JSON.parse(stored)
      } else {
        const created = generateRandomProfile()
        profile.value = created
        localStorage.setItem(STORAGE_KEY, JSON.stringify(created))
      }
    } catch {
      profile.value = generateRandomProfile()
    } finally {
      isLoaded.value = true
    }
  }

  const updateName = (newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    profile.value.name = trimmed
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.value))
    }
  }

  const updateAvatar = (newAvatar: string) => {
    profile.value.avatar = newAvatar
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.value))
    }
  }

  if (typeof window !== 'undefined') {
    loadProfile()
  }

  onMounted(() => {
    loadProfile()
  })

  return {
    profile,
    isLoaded,
    updateName,
    updateAvatar,
    availableAvatars: FUNNY_AVATARS,
  }
}

