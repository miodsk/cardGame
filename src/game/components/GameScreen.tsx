import { GameBoard } from './GameBoard'
import { useGameStore } from '../store/useGameStore'

function getStatusText(phase: string, level: number, remainingAttempts: number) {
  if (phase === 'idle') {
    return '点击开始挑战，进入第一关。'
  }

  if (phase === 'won') {
    return `第 ${level} 关通关，还剩 ${remainingAttempts} 次机会。`
  }

  if (phase === 'completed') {
    return '三关全部完成，恭喜通关。'
  }

  if (phase === 'lost') {
    return `第 ${level} 关挑战失败，机会已用完。`
  }

  if (phase === 'resolving') {
    return `正在结算，剩余 ${remainingAttempts} 次机会。`
  }

  return `第 ${level} 关进行中，剩余 ${remainingAttempts} 次机会。`
}

export function GameScreen() {
  const phase = useGameStore((state) => state.phase)
  const level = useGameStore((state) => state.level)
  const cards = useGameStore((state) => state.cards)
  const history = useGameStore((state) => state.history)
  const remainingAttempts = useGameStore((state) => state.remainingAttempts)
  const startGame = useGameStore((state) => state.startGame)
  const restartLevel = useGameStore((state) => state.restartLevel)
  const flipCard = useGameStore((state) => state.flipCard)
  const undoLastAttempt = useGameStore((state) => state.undoLastAttempt)
  const closeModal = useGameStore((state) => state.closeModal)

  const statusText = getStatusText(phase, level, remainingAttempts)
  const isModalOpen = phase === 'won' || phase === 'lost' || phase === 'completed'

  return (
    <main className="game-shell">
      <section className="game-header">
        <p className="game-eyebrow">Memory Match</p>
        <h1>卡牌消除</h1>
        <p className="game-description">连续翻开两张相同卡牌即可消除，不同就会翻回去。</p>
      </section>

      <section className="game-panel">
        <div className="game-stats">
          <div>
            <span className="label">当前关卡</span>
            <strong>第 {level} 关</strong>
          </div>
          <div>
            <span className="label">剩余机会</span>
            <strong>{remainingAttempts}</strong>
          </div>
          <div>
            <span className="label">可回退次数</span>
            <strong>{history.length}</strong>
          </div>
        </div>

        <div className="game-actions">
          {phase === 'idle' ? (
            <button data-testid="start-button" type="button" onClick={startGame}>
              开始挑战
            </button>
          ) : (
            <>
              <button type="button" onClick={restartLevel}>
                重新挑战
              </button>
              <button
                type="button"
                onClick={undoLastAttempt}
                disabled={(phase !== 'playing' && phase !== 'lost' && phase !== 'won' && phase !== 'completed') || history.length === 0}
              >
                回退
              </button>
            </>
          )}
        </div>

        <p className="game-status">{statusText}</p>
      </section>

      <GameBoard cards={cards} phase={phase} onFlip={flipCard} />

      {isModalOpen ? (
        <div className="game-modal-backdrop">
          <div className="game-modal" data-testid="game-modal">
            <h2>
              {phase === 'won' && '恭喜过关'}
              {phase === 'lost' && '挑战失败'}
              {phase === 'completed' && '全部通关'}
            </h2>
            <p>
              {phase === 'won' && '你已经通过当前关卡，可以进入下一关。'}
              {phase === 'lost' && '机会用完了，再试一次吧。'}
              {phase === 'completed' && '三关全部完成，是否重新开始？'}
            </p>
            <div className="game-modal-actions">
              {history.length > 0 ? (
                <button type="button" className="game-modal-secondary" onClick={undoLastAttempt}>
                  回退上一手
                </button>
              ) : null}
              <button type="button" onClick={closeModal}>
                {phase === 'won' ? '下一关' : '重新挑战'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
