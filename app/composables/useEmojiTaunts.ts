import type { ActiveTaunt, EmojiTauntItem } from '~/types/taunt'
import type { PlayerColor } from '~/types/ludo'
import { AVAILABLE_TAUNTS } from '~/constants/taunts'
import { useFunnySound } from '~/composables/useFunnySound'

export const useEmojiTaunts = () => {
  const activeTaunts = ref<ActiveTaunt[]>([])
  const sound = useFunnySound()

  const triggerTaunt = (
    tauntItem: EmojiTauntItem,
    senderColor: PlayerColor,
    senderName: string
  ) => {
    const randomX = 20 + Math.random() * 60
    const randomY = 20 + Math.random() * 60

    const taunt: ActiveTaunt = {
      id: `taunt-${Date.now()}-${Math.random()}`,
      emoji: tauntItem.emoji,
      label: tauntItem.label,
      senderColor,
      senderName,
      x: randomX,
      y: randomY,
    }

    activeTaunts.value.push(taunt)
    sound.playStep()

    setTimeout(() => {
      activeTaunts.value = activeTaunts.value.filter(t => t.id !== taunt.id)
    }, 2400)
  }

  const triggerRandomBotTaunt = (senderColor: PlayerColor, senderName: string) => {
    const randomIdx = Math.floor(Math.random() * AVAILABLE_TAUNTS.length)
    triggerTaunt(AVAILABLE_TAUNTS[randomIdx], senderColor, senderName)
  }

  return {
    activeTaunts,
    availableTaunts: AVAILABLE_TAUNTS,
    triggerTaunt,
    triggerRandomBotTaunt,
  }
}
