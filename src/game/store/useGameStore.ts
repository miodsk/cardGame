import { create } from 'zustand'

import { getLevelConfig } from '../config'
import { createDeck } from '../lib/createDeck'
import type { Card, GameState, HistoryEntry, LevelNumber } from '../types'

const RESOLVE_DELAY_MS = 600

let resolveTimer: ReturnType<typeof setTimeout> | null = null

function cloneCards(cards: Card[]): Card[] {
  return cards.map((card) => ({ ...card }))
}

function clearResolveTimer() {
  if (resolveTimer) {
    clearTimeout(resolveTimer)
    resolveTimer = null
  }
}

function createLevelState(level: LevelNumber) {
  const levelConfig = getLevelConfig(level)

  return {
    phase: 'playing' as const,
    level,
    cards: createDeck(levelConfig),
    remainingAttempts: levelConfig.maxAttempts,
    history: [] as HistoryEntry[],
    pendingSnapshot: null as HistoryEntry | null,
  }
}

export const useGameStore = create<GameState>()((set, get) => ({
  phase: 'idle',
  level: 1,
  cards: [],
  remainingAttempts: getLevelConfig(1).maxAttempts,
  history: [],
  pendingSnapshot: null,
  startGame: () => {
    clearResolveTimer()
    set(() => createLevelState(1))
  },
  restartLevel: () => {
    clearResolveTimer()
    const level = get().level
    set(() => createLevelState(level))
  },
  advanceLevel: () => {
    clearResolveTimer()
    const nextLevel = Math.min(get().level + 1, 3) as LevelNumber
    set(() => createLevelState(nextLevel))
  },
  flipCard: (id) => {
    const state = get()

    if (state.phase !== 'playing') {
      return
    }

    const target = state.cards.find((card) => card.id === id)

    if (!target || target.isFlipped || target.isEliminated) {
      return
    }

    const visibleCards = state.cards.filter((card) => card.isFlipped && !card.isEliminated)

    if (visibleCards.length >= 2) {
      return
    }

    const pendingSnapshot =
      visibleCards.length === 0
        ? {
            cards: cloneCards(state.cards),
            remainingAttempts: state.remainingAttempts,
          }
        : state.pendingSnapshot

    const nextCards = state.cards.map((card) =>
      card.id === id ? { ...card, isFlipped: true } : card,
    )

    const flippedCards = nextCards.filter((card) => card.isFlipped && !card.isEliminated)

    if (flippedCards.length < 2) {
      set(() => ({
        cards: nextCards,
        pendingSnapshot,
      }))
      return
    }

    set(() => ({
      phase: 'resolving',
      cards: nextCards,
      pendingSnapshot,
    }))

    clearResolveTimer()
    resolveTimer = setTimeout(() => {
      const current = get()
      const resolvingCards = current.cards.filter((card) => card.isFlipped && !card.isEliminated)

      if (resolvingCards.length !== 2 || !current.pendingSnapshot) {
        set(() => ({
          phase: current.phase === 'resolving' ? 'playing' : current.phase,
          pendingSnapshot: null,
        }))
        return
      }

      const [firstCard, secondCard] = resolvingCards
      const isMatch = firstCard.value === secondCard.value
      const remainingAttempts = current.remainingAttempts - 1
      const history = [...current.history, current.pendingSnapshot]

      const resolvedCards = current.cards.map((card) => {
        if (card.id !== firstCard.id && card.id !== secondCard.id) {
          return card
        }

        if (isMatch) {
          return {
            ...card,
            isFlipped: true,
            isEliminated: true,
          }
        }

        return {
          ...card,
          isFlipped: false,
        }
      })

      const isCleared = resolvedCards.every((card) => card.isEliminated)
      const nextPhase = isCleared
        ? current.level === 3
          ? 'completed'
          : 'won'
        : remainingAttempts <= 0
          ? 'lost'
          : 'playing'

      set(() => ({
        phase: nextPhase,
        cards: resolvedCards,
        remainingAttempts,
        history,
        pendingSnapshot: null,
      }))
      resolveTimer = null
    }, RESOLVE_DELAY_MS)
  },
  undoLastAttempt: () => {
    clearResolveTimer()
    const state = get()

    if (state.phase === 'idle' || state.phase === 'resolving' || state.history.length === 0) {
      return
    }

    const previous = state.history[state.history.length - 1]

    set(() => ({
      phase: 'playing',
      cards: cloneCards(previous.cards),
      remainingAttempts: previous.remainingAttempts,
      history: state.history.slice(0, -1),
      pendingSnapshot: null,
    }))
  },
  closeModal: () => {
    const state = get()

    if (state.phase === 'won' && state.level < 3) {
      get().advanceLevel()
      return
    }

    if (state.phase === 'lost' || state.phase === 'completed' || state.phase === 'won') {
      if (state.phase === 'completed') {
        clearResolveTimer()
        set(() => createLevelState(1))
        return
      }

      get().restartLevel()
    }
  },
}))

declare global {
  interface Window {
    __CARD_GAME_STORE__?: typeof useGameStore
  }
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__CARD_GAME_STORE__ = useGameStore
}
