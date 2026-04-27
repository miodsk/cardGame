import { Application, extend } from '@pixi/react'
import { Container, Graphics, Text } from 'pixi.js'
import { useCallback } from 'react'

import { GameCard } from './GameCard'
import type { Card } from '../types'

extend({ Container, Graphics, Text })

const BOARD_WIDTH = 920
const BOARD_HEIGHT = 520
const CARD_WIDTH = 120
const CARD_HEIGHT = 120

interface GameBoardProps {
  cards: Card[]
  phase: string
  onFlip: (id: string) => void
}

function getLayout(cards: Card[]) {
  if (cards.length <= 4) {
    return { columns: 2, rows: 2 }
  }

  if (cards.length <= 8) {
    return { columns: 4, rows: 2 }
  }

  return { columns: 4, rows: 4 }
}

export function GameBoard({ cards, phase, onFlip }: GameBoardProps) {
  const drawBackground = useCallback((graphics: import('pixi.js').Graphics) => {
    graphics.clear()
    graphics.roundRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT, 28)
    graphics.fill({ color: 0xf8f4ff, alpha: 1 })
    graphics.stroke({ color: 0xe2d6fb, width: 2, alpha: 1 })
  }, [])

  const { columns, rows } = getLayout(cards)
  const horizontalGap = 20
  const verticalGap = 20
  const totalWidth = columns * CARD_WIDTH + (columns - 1) * horizontalGap
  const totalHeight = rows * CARD_HEIGHT + (rows - 1) * verticalGap
  const startX = (BOARD_WIDTH - totalWidth) / 2
  const startY = (BOARD_HEIGHT - totalHeight) / 2

  return (
    <div className="game-board" data-testid="game-board">
      <Application width={BOARD_WIDTH} height={BOARD_HEIGHT} backgroundAlpha={0} antialias>
        <pixiGraphics draw={drawBackground} />
        {cards.map((card, index) => {
          const column = index % columns
          const row = Math.floor(index / columns)

          return (
            <GameCard
              key={card.id}
              card={card}
              x={startX + column * (CARD_WIDTH + horizontalGap)}
              y={startY + row * (CARD_HEIGHT + verticalGap)}
              disabled={
                card.isEliminated ||
                phase === 'idle' ||
                phase === 'won' ||
                phase === 'lost' ||
                phase === 'completed' ||
                phase === 'resolving'
              }
              onFlip={onFlip}
            />
          )
        })}
      </Application>
      {cards.length === 0 ? <div className="game-empty">准备好后开始挑战。</div> : null}
    </div>
  )
}
