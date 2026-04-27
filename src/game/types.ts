export type Phase = 'idle' | 'playing' | 'resolving' | 'won' | 'lost' | 'completed'

export type LevelNumber = 1 | 2 | 3

export interface Card {
  id: string
  value: number
  isFlipped: boolean
  isEliminated: boolean
}

export interface Level {
  level: LevelNumber
  cardCount: 4 | 8 | 16
  maxAttempts: 3 | 6 | 12
}

export interface HistoryEntry {
  cards: Card[]
  remainingAttempts: number
}

export interface GameState {
  phase: Phase
  level: LevelNumber
  cards: Card[]
  remainingAttempts: number
  history: HistoryEntry[]
  pendingSnapshot: HistoryEntry | null
  startGame: () => void
  restartLevel: () => void
  advanceLevel: () => void
  flipCard: (id: string) => void
  undoLastAttempt: () => void
  closeModal: () => void
}
