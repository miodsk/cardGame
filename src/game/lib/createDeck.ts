import type { Card, Level } from '../types'

function shuffle<T>(items: T[]): T[] {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

export function createDeck(levelConfig: Level): Card[] {
  const pairCount = levelConfig.cardCount / 2
  const values = Array.from({ length: pairCount }, (_, index) => index + 1)

  const duplicated = values.flatMap((value, pairIndex) => [
    {
      id: `${levelConfig.level}-${pairIndex}-a`,
      value,
      isFlipped: false,
      isEliminated: false,
    },
    {
      id: `${levelConfig.level}-${pairIndex}-b`,
      value,
      isFlipped: false,
      isEliminated: false,
    },
  ])

  return shuffle(duplicated)
}
