import type { Player, Token } from '~/types/ludo'
import { getPlayerFullPath, isSafeSquare } from '~/utils/ludoBoard'

export const selectBestBotToken = (
  movableTokens: Token[],
  diceValue: number,
  allPlayers: Player[]
): Token => {
  if (movableTokens.length === 1) {
    return movableTokens[0]
  }

  let bestToken = movableTokens[0]
  let bestScore = -Infinity

  for (const token of movableTokens) {
    let score = 0
    const path = getPlayerFullPath(token.color)

    if (token.status === 'home') {
      score += 65
    } else {
      const nextStep = token.step + diceValue

      if (nextStep === 56) {
        score += 90
      } else if (nextStep < 56) {
        const nextCoord = path[nextStep]

        if (isSafeSquare(nextCoord.row, nextCoord.col)) {
          score += 45
        }

        const canCapture = allPlayers.some(
          p =>
            p.color !== token.color &&
            p.tokens.some(
              t =>
                (t.status === 'path' || t.status === 'goal_track') &&
                t.position.row === nextCoord.row &&
                t.position.col === nextCoord.col &&
                !isSafeSquare(nextCoord.row, nextCoord.col)
            )
        )

        if (canCapture) {
          score += 120
        }

        score += nextStep * 0.5
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestToken = token
    }
  }

  return bestToken
}
