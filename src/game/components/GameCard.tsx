import { useCallback } from 'react'

import type { Card } from '../types'

const CARD_WIDTH = 120
const CARD_HEIGHT = 120
const CARD_RADIUS = 24

interface GameCardProps {
  card: Card
  x: number
  y: number
  disabled: boolean
  onFlip: (id: string) => void
}

export function GameCard({ card, x, y, disabled, onFlip }: GameCardProps) {
  const drawCard = useCallback(
    (graphics: import('pixi.js').Graphics) => {
      graphics.clear()

      const fill = card.isEliminated
        ? 0x31294f
        : card.isFlipped
          ? 0xf3ebff
          : 0x8f5cff

      const alpha = card.isEliminated ? 0.3 : 1
      const lineColor = card.isFlipped ? 0x8f5cff : 0xd9c3ff

      graphics.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS)
      graphics.fill({ color: fill, alpha })
      graphics.stroke({ color: lineColor, width: 3, alpha: 1 })
    },
    [card.isEliminated, card.isFlipped],
  )

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics
        draw={drawCard}
        eventMode={disabled ? 'none' : 'static'}
        cursor={disabled ? 'default' : 'pointer'}
        onPointerTap={() => onFlip(card.id)}
      />
      <pixiText
        anchor={0.5}
        x={CARD_WIDTH / 2}
        y={CARD_HEIGHT / 2}
        text={card.isFlipped || card.isEliminated ? String(card.value) : '?'}
        style={{
          fill: card.isFlipped || card.isEliminated ? '#1a1325' : '#ffffff',
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontSize: 34,
          fontWeight: '700',
        }}
      />
    </pixiContainer>
  )
}
