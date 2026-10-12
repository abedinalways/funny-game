import { ref, computed } from 'vue'
import type { PlayerColor } from '../types/ludo'
import type { SnakeLudoState, SnakePlayer, SnakeHistoryMessage } from '../types/snakeLudo'
import { SNAKES_AND_LADDERS } from '../constants/snakeLudo'
import { useFunnySound } from './useFunnySound'

export function useSnakeLudoEngine() {
  const sound = useFunnySound()

  const state = ref<SnakeLudoState>({
    players: [
      { id: 'red', name: 'লাল বাদশা', avatar: '🦁', color: 'red', position: 0, isBot: false, hasWon: false },
      { id: 'green', name: 'সবুজ টাইগার', avatar: '🐸', color: 'green', position: 0, isBot: true, hasWon: false },
      { id: 'yellow', name: 'হলুদ চিতা', avatar: '🐯', color: 'yellow', position: 0, isBot: true, hasWon: false },
      { id: 'blue', name: 'নীল পালোয়ান', avatar: '🐘', color: 'blue', position: 0, isBot: true, hasWon: false }
    ],
    activePlayerIndex: 0,
    diceValue: null,
    isRolling: false,
    winnerQueue: [],
    isGameOver: false,
    lastEventMessage: 'খেলা শুরু করার জন্য ডাইস রোল করো!',
    lastEventType: null,
    history: []
  })

  const activePlayer = computed(() => state.value.players[state.value.activePlayerIndex])

  const findSnakeOrLadder = (pos: number) => {
    return SNAKES_AND_LADDERS.find(item => item.start === pos) || null
  }

  const addHistory = (sender: string, color: PlayerColor, text: string, type: SnakeHistoryMessage['type']) => {
    state.value.history.unshift({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender,
      color,
      text,
      type
    })
    if (state.value.history.length > 25) {
      state.value.history.pop()
    }
  }

  const advanceTurn = () => {
    if (state.value.isGameOver) return

    let nextIndex = (state.value.activePlayerIndex + 1) % state.value.players.length
    let attempts = 0

    while (state.value.players[nextIndex].hasWon && attempts < state.value.players.length) {
      nextIndex = (nextIndex + 1) % state.value.players.length
      attempts++
    }

    state.value.activePlayerIndex = nextIndex
    state.value.diceValue = null

    if (activePlayer.value.isBot && !activePlayer.value.hasWon) {
      setTimeout(() => {
        rollDice()
      }, 900)
    }
  }

  const rollDice = async (forcedRoll?: number) => {
    if (state.value.isRolling || state.value.isGameOver) return
    const current = activePlayer.value
    if (current.hasWon) return

    try {
      state.value.isRolling = true
      try {
        sound.playRoll()
      } catch {}

      await new Promise(r => setTimeout(r, 600))

      const roll = forcedRoll || (Math.floor(Math.random() * 6) + 1)
      state.value.diceValue = roll
      state.value.isRolling = false

      await handlePlayerMove(roll)
    } catch {
      state.value.isRolling = false
    }
  }

  const handlePlayerMove = async (steps: number) => {
    const player = activePlayer.value
    const prevPos = player.position

    let targetPos = prevPos + steps

    if (targetPos > 100) {
      const msg = `${player.name} ১০০ এর বেশি হয়ে গেছে (${targetPos})! ঢোকা যাবে না। দরকার ছিল ${100 - prevPos}!`
      state.value.lastEventType = 'move'
      state.value.lastEventMessage = msg
      addHistory(player.name, player.color, msg, 'penalty')
      try {
        sound.playKill()
      } catch {}
      await new Promise(r => setTimeout(r, 800))
      advanceTurn()
      return
    }

    player.position = targetPos
    try {
      sound.playStep()
    } catch {}

    await new Promise(r => setTimeout(r, 450))

    const encounter = findSnakeOrLadder(targetPos)
    if (encounter) {
      if (encounter.type === 'snake') {
        state.value.lastEventType = 'snake'
        state.value.lastEventMessage = encounter.trollMessage
        addHistory(player.name, player.color, encounter.trollMessage, 'snake')
        try {
          sound.playKill()
        } catch {}
        await new Promise(r => setTimeout(r, 600))
        player.position = encounter.end
      } else {
        state.value.lastEventType = 'ladder'
        state.value.lastEventMessage = encounter.trollMessage
        addHistory(player.name, player.color, encounter.trollMessage, 'ladder')
        try {
          sound.playHome()
        } catch {}
        await new Promise(r => setTimeout(r, 600))
        player.position = encounter.end
      }
    } else {
      const msg = `${player.name} ডাইসে ${steps} ফেলে পৌঁছে গেল ${player.position} নাম্বার ঘরে!`
      state.value.lastEventType = 'move'
      state.value.lastEventMessage = msg
      addHistory(player.name, player.color, msg, 'move')
    }

    if (player.position === 100) {
      player.hasWon = true
      player.rank = state.value.winnerQueue.length + 1
      state.value.winnerQueue.push(player.id)
      try {
        sound.playWin()
      } catch {}
      const winMsg = `🎉 বিজয়ী! ${player.name} ${player.rank} নাম্বার স্থান অধিকার করেছে!`
      state.value.lastEventMessage = winMsg
      addHistory(player.name, player.color, winMsg, 'win')

      const activeRemaining = state.value.players.filter(p => !p.hasWon)
      if (activeRemaining.length <= 1) {
        state.value.isGameOver = true
        return
      }
    }

    if (steps === 6 && !player.hasWon) {
      try {
        sound.playSix()
      } catch {}
      const sixMsg = `🔥 ${player.name} ছক্কা মেরেছে! বোনাস রোল পেয়ে গেল!`
      state.value.lastEventType = 'six'
      state.value.lastEventMessage = sixMsg
      addHistory(player.name, player.color, sixMsg, 'six')
      if (player.isBot) {
        setTimeout(() => {
          rollDice()
        }, 900)
      }
      return
    }

    advanceTurn()
  }

  const toggleBot = (color: PlayerColor) => {
    const p = state.value.players.find(x => x.id === color)
    if (p) {
      p.isBot = !p.isBot
      if (activePlayer.value.id === color && p.isBot && !p.hasWon && !state.value.isRolling) {
        setTimeout(() => {
          rollDice()
        }, 500)
      }
    }
  }

  const resetGame = () => {
    state.value.players.forEach(p => {
      p.position = 0
      p.hasWon = false
      p.rank = undefined
    })
    state.value.activePlayerIndex = 0
    state.value.diceValue = null
    state.value.isRolling = false
    state.value.winnerQueue = []
    state.value.isGameOver = false
    state.value.lastEventMessage = 'নতুন খেলা শুরু হলো! শুভকামনা!'
    state.value.lastEventType = null
    state.value.history = []
  }

  const setPlayerName = (color: PlayerColor, name: string, avatar?: string) => {
    const p = state.value.players.find(x => x.id === color)
    if (p) {
      p.name = name
      if (avatar) p.avatar = avatar
    }
  }

  return {
    state,
    activePlayer,
    rollDice,
    toggleBot,
    resetGame,
    setPlayerName,
    findSnakeOrLadder,
    addHistory
  }
}
