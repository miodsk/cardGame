import type { Level, LevelNumber } from './types'

export const LEVELS: readonly Level[] = [
  { level: 1, cardCount: 4, maxAttempts: 3 },
  { level: 2, cardCount: 8, maxAttempts: 6 },
  { level: 3, cardCount: 16, maxAttempts: 12 },
] as const

export function getLevelConfig(level: LevelNumber): Level {
  return LEVELS.find((item) => item.level === level) ?? LEVELS[0]
}
