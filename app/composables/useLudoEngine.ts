import type {
  BoardCoordinate,
  GamePhase,
  Player,
  PlayerColor,
  Token,
  FunnyMessage,
} from '~/types/ludo'
import {
  coordKey,
  getBaseSlotCoordinate,
  getPlayerFullPath,
  getTargetCoordinate,
  isSafeSquare,
} from '~/utils/ludoBoard'
import { getRandomQuote } from '~/constants/funnyDialogs'
import { useFunnySound } from '~/composables/useFunnySound'
import { selectBestBotToken } from '~/utils/ludoBotStrategy'

const TURN_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue']

const DEFAULT_PLAYERS_META: Record<PlayerColor, { name: string; isBot: boolean }> = {
  red: { name: 'You (Player 1)', isBot: false },
  green: { name: 'বল্টু (Bot)', isBot: true },
  yellow: { name: 'মন্টু (Bot)', isBot: true },
  blue: { name: 'ঝন্টু (Bot)', isBot: true },
}

const createInitialPlayers = (): Player[] => {
  return TURN_ORDER.map((color) => {
    const tokens: Token[] = Array.from({ length: 4 }, (_, index) => {
      const position = getBaseSlotCoordinate(color, index)
      return {
        id: `${color}-token-${index}`,
        color,
        index,
        status: 'home',
        step: -1,
        position,
      }
    })

    const meta = DEFAULT_PLAYERS_META[color]

    return {
      id: color,
      name: meta.name,
      color,
      isBot: meta.isBot,
      avatar: color,
      tokens,
      hasFinished: false,
    }
  })
}

export const useLudoEngine = () => {
  const sound = useFunnySound()
  const players = ref<Player[]>(createInitialPlayers())
  const activePlayerColor = ref<PlayerColor>('red')
  const diceValue = ref<number | null>(null)
  const isRolling = ref<boolean>(false)
  const phase = ref<GamePhase>('idle')
  const consecutiveSixes = ref<number>(0)
  const movingTokenId = ref<string | null>(null)
  const winners = ref<PlayerColor[]>([])
  const history = ref<FunnyMessage[]>([])

  const activePlayer = computed<Player>(() => {
    return players.value.find(p => p.color === activePlayerColor.value)!
  })

  const addFunnyMessage = (sender: string, color: PlayerColor, text: string) => {
    history.value.unshift({
      id: `msg-${Date.now()}-${Math.random()}`,
      sender,
      color,
      text,
      timestamp: Date.now(),
    })
    if (history.value.length > 20) {
      history.value.pop()
    }
  }

  const getMovableTokens = (color: PlayerColor, dice: number): Token[] => {
    const player = players.value.find(p => p.color === color)
    if (!player) return []

    return player.tokens.filter((token) => {
      if (token.status === 'finished') return false
      if (token.status === 'home') return dice === 6
      return token.step + dice <= 56
    })
  }

  const canMoveTokenIds = computed<string[]>(() => {
    if (phase.value !== 'select_token' || diceValue.value === null) return []
    return getMovableTokens(activePlayerColor.value, diceValue.value).map(t => t.id)
  })

  const destinationMap = computed<Map<string, { token: Token; color: PlayerColor }>>(() => {
    const map = new Map<string, { token: Token; color: PlayerColor }>()
    if (phase.value !== 'select_token' || diceValue.value === null) return map

    const movable = getMovableTokens(activePlayerColor.value, diceValue.value)
    for (const token of movable) {
      const target = getTargetCoordinate(token, diceValue.value)
      if (target) {
        map.set(coordKey(target.row, target.col), { token, color: token.color })
      }
    }
    return map
  })

  const canRollDice = computed<boolean>(() => {
    return phase.value === 'idle' && !isRolling.value && winners.value.length < 3
  })

  const nextTurn = () => {
    const currentIndex = TURN_ORDER.indexOf(activePlayerColor.value)
    for (let i = 1; i <= TURN_ORDER.length; i++) {
      const nextColor = TURN_ORDER[(currentIndex + i) % TURN_ORDER.length]
      const player = players.value.find(p => p.color === nextColor)
      if (player && !player.hasFinished) {
        activePlayerColor.value = nextColor
        diceValue.value = null
        phase.value = 'idle'
        return
      }
    }
  }

  const rollDice = async (): Promise<number> => {
    if (!canRollDice.value) return 0

    isRolling.value = true
    phase.value = 'rolling'
    sound.playRoll()

    await new Promise(resolve => setTimeout(resolve, 600))

    const rolled = Math.floor(Math.random() * 6) + 1
    diceValue.value = rolled
    isRolling.value = false

    if (rolled === 6) {
      consecutiveSixes.value += 1
      sound.playSix()
      addFunnyMessage(activePlayer.value.name, activePlayerColor.value, getRandomQuote('six'))

      if (consecutiveSixes.value === 3) {
        consecutiveSixes.value = 0
        addFunnyMessage(
          'Referee',
          activePlayerColor.value,
          'টানা ৩টা ছক্কা?! চিটিং বাতিল! চাল বাতিল!'
        )
        nextTurn()
        return rolled
      }
    } else {
      consecutiveSixes.value = 0
    }

    const movable = getMovableTokens(activePlayerColor.value, rolled)

    if (movable.length === 0) {
      phase.value = 'idle'
      addFunnyMessage(activePlayer.value.name, activePlayerColor.value, getRandomQuote('miss'))
      setTimeout(() => {
        nextTurn()
      }, 900)
    } else {
      phase.value = 'select_token'
    }

    return rolled
  }

  const checkCaptures = (movedToken: Token): boolean => {
    if (isSafeSquare(movedToken.position.row, movedToken.position.col)) {
      return false
    }

    let captured = false

    for (const player of players.value) {
      if (player.color === movedToken.color) continue

      for (const token of player.tokens) {
        if (
          (token.status === 'path' || token.status === 'goal_track') &&
          token.position.row === movedToken.position.row &&
          token.position.col === movedToken.position.col
        ) {
          token.status = 'home'
          token.step = -1
          token.position = getBaseSlotCoordinate(token.color, token.index)
          captured = true
          sound.playKill()

          addFunnyMessage(activePlayer.value.name, activePlayerColor.value, getRandomQuote('kill'))
          addFunnyMessage(player.name, player.color, getRandomQuote('killed'))
        }
      }
    }

    return captured
  }

  const selectToken = async (token: Token) => {
    if (phase.value !== 'select_token' || diceValue.value === null) return
    if (!canMoveTokenIds.value.includes(token.id)) return

    phase.value = 'moving'
    movingTokenId.value = token.id

    const roll = diceValue.value
    const path = getPlayerFullPath(token.color)

    if (token.status === 'home') {
      token.status = 'path'
      token.step = 0
      token.position = path[0]
      sound.playStep()
    } else {
      const targetStep = token.step + roll
      for (let s = token.step + 1; s <= targetStep; s++) {
        token.step = s
        token.position = path[s]
        sound.playStep()
        await new Promise(resolve => setTimeout(resolve, 80))
      }

      if (token.step === 56) {
        token.status = 'finished'
        sound.playHome()
        addFunnyMessage(activePlayer.value.name, activePlayerColor.value, getRandomQuote('home'))
      } else if (token.step >= 51) {
        token.status = 'goal_track'
      } else {
        token.status = 'path'
      }
    }

    const hasCaptured = checkCaptures(token)
    movingTokenId.value = null

    const allFinished = activePlayer.value.tokens.every(t => t.status === 'finished')
    if (allFinished && !activePlayer.value.hasFinished) {
      activePlayer.value.hasFinished = true
      winners.value.push(activePlayerColor.value)
      sound.playWin()
      addFunnyMessage(activePlayer.value.name, activePlayerColor.value, getRandomQuote('win'))

      if (winners.value.length === 3) {
        phase.value = 'game_over'
        return
      }
    }

    const hasExtraTurn = roll === 6 || hasCaptured || token.status === 'finished'

    if (hasExtraTurn && !activePlayer.value.hasFinished) {
      phase.value = 'idle'
      diceValue.value = null
    } else {
      nextTurn()
    }
  }

  const togglePlayerBot = (color: PlayerColor) => {
    const player = players.value.find(p => p.color === color)
    if (player) {
      player.isBot = !player.isBot
      const prefix = color.charAt(0).toUpperCase() + color.slice(1)
      player.name = player.isBot ? `${prefix} (Bot)` : `${prefix} (Human)`
    }
  }

  watch([activePlayerColor, phase], async ([color, currentPhase]) => {
    const player = players.value.find(p => p.color === color)
    if (!player || !player.isBot || winners.value.length >= 3) return

    if (currentPhase === 'idle' && !isRolling.value) {
      await new Promise(resolve => setTimeout(resolve, 700))
      if (phase.value === 'idle' && activePlayerColor.value === color) {
        await rollDice()
      }
    } else if (currentPhase === 'select_token' && diceValue.value !== null) {
      const movable = getMovableTokens(color, diceValue.value)
      if (movable.length > 0) {
        const bestToken = selectBestBotToken(movable, diceValue.value, players.value)
        await new Promise(resolve => setTimeout(resolve, 600))
        if (phase.value === 'select_token' && activePlayerColor.value === color) {
          await selectToken(bestToken)
        }
      }
    }
  })

  const resetGame = () => {
    players.value = createInitialPlayers()
    activePlayerColor.value = 'red'
    diceValue.value = null
    isRolling.value = false
    phase.value = 'idle'
    consecutiveSixes.value = 0
    movingTokenId.value = null
    winners.value = []
    history.value = []
    addFunnyMessage('Game', 'red', 'নতুন লুডু খেলা শুরু হয়েছে! শুভকামনা!')
  }

  return {
    players,
    activePlayerColor,
    activePlayer,
    diceValue,
    isRolling,
    phase,
    canMoveTokenIds,
    destinationMap,
    canRollDice,
    movingTokenId,
    winners,
    history,
    isMuted: sound.isMuted,
    toggleMute: sound.toggleMute,
    togglePlayerBot,
    rollDice,
    selectToken,
    resetGame,
  }
}
