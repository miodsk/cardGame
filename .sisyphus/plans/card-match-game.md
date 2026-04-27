# Card Match Elimination Game

## TL;DR
> **Summary**: Replace the starter Vite screen with a three-level card matching mini-game using a mixed `@pixi/react` + React DOM UI, with Zustand as the single source of truth for rules, progress, undo, and outcome state.
> **Deliverables**:
> - Three playable levels with `4 / 8 / 16` cards and attempt limits `3 / 6 / 12`
> - Pixi-rendered card board with pair matching, mismatch restore, elimination, and interaction locking
> - React DOM controls for start, restart, undo, next level, retry, and final completion
> - Zustand store with deterministic level config, undo snapshots, and dev-only debug exposure
> **Effort**: Medium
> **Parallel**: YES - 4 waves
> **Critical Path**: 1 → 2 → 3 + 4 → 5 → 6

## Context
### Original Request
Build a “对对消除” mini-game where the player flips two cards at a time, matching pairs are eliminated, mismatches restore, levels scale from `4` to `8` to `16` cards, and the game supports start/restart, limited pair attempts, success/failure prompts, next-level progression, and undo.

### Interview Summary
- Rendering mode is **mixed**: Pixi renders the board, React DOM renders buttons/modals.
- State management is **Zustand**; user already installed `zustand` in `package.json:12`.
- Attempt counting is **per completed pair attempt**, not per single card flip.
- Undo means **revert the most recent completed pair attempt** and refund that attempt.
- MVP scope is **core gameplay only**: no score, timer, sound, persistence, extra animation requirements, or additional levels.
- Attempt limits are fixed to `3 / 6 / 12` for the three levels.

### Metis Review (gaps addressed)
- Resolve matching ambiguity by defining each level deck as **N unique values, each duplicated exactly twice**, then shuffled on level start/restart.
- Resolve restart ambiguity by defining **restart = restart current level**; initial “开始挑战” always starts level 1.
- Resolve level-end ambiguity by defining level 3 success as a **final completion state** with `重新挑战` returning to level 1; no level 4.
- Add guardrails: ignore clicking the same card twice, ignore clicks on eliminated cards, lock board while resolving a pair, disable undo unless at least one completed attempt exists and phase is `playing`.
- Add verification hook: expose the Zustand store on `window.__CARD_GAME_STORE__` in dev mode only so browser automation can inspect and drive exact states without adding a test framework.

## Work Objectives
### Core Objective
Deliver a single-screen browser mini-game that replaces the current Vite starter UI and fully supports the agreed three-level card matching flow with Pixi-rendered cards and Zustand-driven game state.

### Deliverables
- Game shell replacing starter content in `src/App.tsx`
- Typed game domain/configuration files under `src/game/`
- Zustand store managing phases, cards, attempts, and undo history
- Pixi board/canvas components rendering deterministic level layouts and card interactions
- React DOM controls and modals for start, restart, undo, next level, retry, and final completion
- Updated app styling in `src/App.css` and `src/index.css`

### Definition of Done (verifiable conditions with commands)
- `npm run lint` passes with no new lint errors.
- `npm run build` succeeds.
- Browser QA confirms level 1, 2, and 3 start with `4 / 8 / 16` cards and `3 / 6 / 12` attempts respectively.
- Browser QA confirms matching removes cards, mismatching restores cards after a short delay, and undo restores the previous completed attempt while refunding the attempt count.
- Browser QA confirms level success shows next-level CTA for levels 1-2 and final completion CTA for level 3.
- Browser QA confirms exhausting attempts shows failure modal with retry.

### Must Have
- Single source of truth in Zustand
- Level config hard-coded to exactly 3 levels
- Pair evaluation triggered only after two distinct non-eliminated cards are flipped
- Restart resets the current level only
- Start challenge always initializes level 1
- Undo restores the full previous board snapshot and refunds one attempt

### Must NOT Have
- No routing, persistence, leaderboard, score, timer, sound, or network calls
- No additional levels beyond 3
- No second state source duplicating board/attempt logic in React local state
- No direct mutation of card arrays outside store actions
- No undo during idle, won, lost, completed, or pair-resolution lock states

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: **none** for project test framework; use existing `eslint` + `vite build` plus browser automation/manual-agent QA.
- QA policy: Every task includes agent-executable scenarios using `Bash` and `Playwright` against the local Vite dev server.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: `1` foundation shell, `2` game domain/store foundation  
Wave 2: `3` Pixi board rendering, `4` DOM controls/modals  
Wave 3: `5` app integration and full flow wiring  
Wave 4: `6` polish, responsive styling, verification hooks cleanup

### Dependency Matrix (full, all tasks)
| Task | Blocks | Blocked By |
|---|---|---|
| 1 | 5, 6 | - |
| 2 | 3, 4, 5, 6 | - |
| 3 | 5, 6 | 2 |
| 4 | 5, 6 | 2 |
| 5 | 6 | 1, 2, 3, 4 |
| 6 | F1, F2, F3, F4 | 1, 2, 3, 4, 5 |

### Agent Dispatch Summary
| Wave | Task Count | Categories |
|---|---:|---|
| Wave 1 | 2 | `quick`, `quick` |
| Wave 2 | 2 | `visual-engineering`, `quick` |
| Wave 3 | 1 | `unspecified-high` |
| Wave 4 | 1 | `visual-engineering` |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Replace starter app with game shell

  **What to do**: Replace the Vite starter content in `src/App.tsx` with a top-level game shell component that renders a title area, status/controls region, Pixi board mount, and modal host. Remove imports for starter assets and counter state. Keep `src/main.tsx` unchanged. Create `src/game/components/GameScreen.tsx` as the main composition component and make `src/App.tsx` a thin wrapper that only imports styles and returns `<GameScreen />`.
  **Must NOT do**: Do not keep any starter hero/docs markup, do not introduce routing, and do not put gameplay rules directly in `src/App.tsx`.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: focused starter replacement with clear boundaries
  - Skills: `[]` - no special skill required beyond repo conventions
  - Omitted: `frontend-design` - visual polish is limited to MVP game shell, not open-ended design work

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: `5, 6` | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/App.tsx:7` - current root component to replace entirely
  - Pattern: `src/main.tsx:6` - root render pipeline remains untouched
  - Pattern: `src/App.css:59` - existing centered layout pattern that can be repurposed or replaced cleanly
  - Pattern: `src/index.css:53` - root container sizing and app-level layout constraints

  **Acceptance Criteria** (agent-executable only):
  - [ ] `src/App.tsx` no longer imports starter assets or `useState`
  - [ ] `src/game/components/GameScreen.tsx` exists and is the primary game shell
  - [ ] Running the app shows game framing instead of Vite starter content

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Starter content removed
    Tool: Playwright
    Steps: Start `npm run dev`; open the local app; assert text "Get started" is absent; assert a start button labeled "开始挑战" is present.
    Expected: No Vite starter hero/counter/docs content remains; game shell is visible.
    Evidence: .sisyphus/evidence/task-1-game-shell.png

  Scenario: App still compiles after shell replacement
    Tool: Bash
    Steps: Run `npm run build`.
    Expected: Build succeeds without unresolved starter asset imports.
    Evidence: .sisyphus/evidence/task-1-game-shell-build.txt
  ```

  **Commit**: NO | Message: `feat(game): replace starter shell` | Files: `src/App.tsx`, `src/game/components/GameScreen.tsx`, `src/App.css`

- [ ] 2. Define game config and Zustand state machine

  **What to do**: Create `src/game/types.ts`, `src/game/config.ts`, `src/game/lib/createDeck.ts`, and `src/game/store/useGameStore.ts`. Model card data as `{ id, value, isFlipped, isEliminated }`, level config as an array for levels `1..3` with exact card counts `4/8/16` and attempt limits `3/6/12`, and store phase as `idle | playing | won | lost | completed | resolving`. Implement actions for `startGame`, `restartLevel`, `advanceLevel`, `flipCard`, `undoLastAttempt`, `closeModal`, and internal helpers to snapshot/restore board state. Shuffle each level deck on initialization/restart using Fisher-Yates. Expose the store in dev only as `window.__CARD_GAME_STORE__ = useGameStore` to support automated QA.
  **Must NOT do**: Do not store duplicate derived data in multiple places, do not use React local state for game rules, and do not allow undo to mutate history incorrectly.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: deterministic domain/state work with limited file surface
  - Skills: `[]` - no extra domain skill required
  - Omitted: `systematic-debugging` - this is greenfield state modeling, not reactive debugging

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: `3, 4, 5, 6` | Blocked By: none

  **References**:
  - API/Type: `package.json:12` - confirms runtime deps `@pixi/react`, `pixi.js`, `react`, `zustand`
  - Pattern: `src/App.tsx:7` - starter local state should not be copied into the new game flow
  - Pattern: `eslint.config.js:11` - all new `.ts/.tsx` files must satisfy current lint rules
  - External: `https://zustand.docs.pmnd.rs/getting-started/introduction` - store creation and selector usage patterns

  **Acceptance Criteria**:
  - [ ] Level config is centralized and hard-codes exactly three levels with counts/attempts `4/3`, `8/6`, `16/12`
  - [ ] `flipCard` ignores the same card twice, eliminated cards, and any interaction during `resolving`
  - [ ] Completed pair attempts push one undo snapshot and refund exactly one attempt when undone
  - [ ] In dev mode, `window.__CARD_GAME_STORE__` is readable in the browser console

  **QA Scenarios**:
  ```
  Scenario: Store initializes level 1 correctly
    Tool: Playwright
    Steps: Start `npm run dev`; open the app; click "开始挑战"; evaluate `window.__CARD_GAME_STORE__.getState()` in the page.
    Expected: `phase === 'playing'`, `level === 1`, `cards.length === 4`, `remainingAttempts === 3`, `history.length === 0`.
    Evidence: .sisyphus/evidence/task-2-store-init.json

  Scenario: Restart resets current level state
    Tool: Playwright
    Steps: Start level 1; use the store in page context to flip two cards and mutate state; click "重新挑战"; re-read store state.
    Expected: Level remains `1`, deck is regenerated face-down, history clears, remaining attempts reset to `3`.
    Evidence: .sisyphus/evidence/task-2-store-restart.json
  ```

  **Commit**: NO | Message: `feat(game): add state machine and level config` | Files: `src/game/types.ts`, `src/game/config.ts`, `src/game/lib/createDeck.ts`, `src/game/store/useGameStore.ts`

- [ ] 3. Build Pixi board and card rendering

  **What to do**: Create `src/game/components/GameBoard.tsx` and `src/game/components/GameCard.tsx`. Register Pixi display objects with `@pixi/react` using `extend` so the board renders inside a stable canvas component. Render cards as simple rounded rectangles with a neutral back face and a front face showing the card `value` as text; no external image assets. Use deterministic layout rules: level 1 = `2x2`, level 2 = `4x2`, level 3 = `4x4`. Keep board width/height fixed enough that card centers are deterministic for automated clicks. Make each card emit `flipCard(card.id)` on pointer tap only when the store allows interaction.
  **Must NOT do**: Do not render gameplay controls inside Pixi, do not load extra textures/assets, and do not let layout depend on random per-card positions beyond deck shuffle order.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: Pixi scene composition and interactive canvas rendering
  - Skills: `[]` - implementation relies on existing Pixi React primitives already installed
  - Omitted: `frontend-design` - aesthetic flourish is out of scope for this MVP

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: `5, 6` | Blocked By: `2`

  **References**:
  - Pattern: `package.json:13` - confirms Pixi runtime packages are already installed
  - Pattern: `vite.config.ts:6` - React/Vite plugin stack is already configured; no build config changes are required
  - External: `https://react.pixijs.io/7.x/custom-component/` - `extend` and Pixi component registration concepts
  - External: `https://pixijs.com/8.x/guides/components/scene-objects/graphics` - rendering rectangles/text with Pixi 8

  **Acceptance Criteria**:
  - [ ] Board renders exactly `4`, `8`, or `16` cards based on current level
  - [ ] Face-down cards render a uniform back face; flipped cards render their value text; eliminated cards are visually hidden or fully transparent/non-interactive
  - [ ] Card centers are deterministic by grid position so browser automation can click them reliably

  **QA Scenarios**:
  ```
  Scenario: Board shows correct card counts per level
    Tool: Playwright
    Steps: Start the app; inspect `window.__CARD_GAME_STORE__.getState()` to force level 1, 2, then 3 via store actions; after each transition capture the canvas screenshot.
    Expected: Screenshots show `2x2`, `4x2`, and `4x4` card grids matching the current store level.
    Evidence: .sisyphus/evidence/task-3-board-levels.png

  Scenario: Eliminated cards stop responding
    Tool: Playwright
    Steps: Use store state to identify a matching pair; click their board coordinates; after elimination, click the same coordinates again.
    Expected: Eliminated pair stays removed and store state does not change on repeated clicks.
    Evidence: .sisyphus/evidence/task-3-board-elimination.json
  ```

  **Commit**: NO | Message: `feat(game): render pixi card board` | Files: `src/game/components/GameBoard.tsx`, `src/game/components/GameCard.tsx`

- [ ] 4. Build React DOM controls and outcome modals

  **What to do**: Create `src/game/components/GameControls.tsx` and `src/game/components/GameModal.tsx`. Controls must show current level, remaining attempts, and buttons for `开始挑战` (idle only), `重新挑战` (playing/won/lost/completed), and `回退` (enabled only during `playing` when history exists). Modal content must branch to three outcomes: level win (`下一关` for levels 1-2), level loss (`重新挑战`), and final completion on level 3 (`重新挑战` that resets to level 1). Keep labels in Chinese to match the user’s requested UI language.
  **Must NOT do**: Do not duplicate game logic in controls/modals, do not show `下一关` on level 3, and do not allow modal actions that bypass store invariants.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: straightforward DOM control wiring against an existing store contract
  - Skills: `[]` - no extra skill required
  - Omitted: `visual-engineering` - these are standard DOM buttons/modals, not canvas work

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: `5, 6` | Blocked By: `2`

  **References**:
  - Pattern: `src/index.css:69` - heading typography already exists and can be reused/adapted
  - Pattern: `src/App.css:1` - existing button/focus styling pattern can be reworked for controls
  - API/Type: `src/game/store/useGameStore.ts` - consume selectors/actions instead of adding duplicate local state

  **Acceptance Criteria**:
  - [ ] Idle view shows `开始挑战` only as the primary action
  - [ ] Playing view shows current level and remaining attempts, plus `回退` only when history length > 0
  - [ ] Winning level 1 or 2 opens modal with `下一关`; losing opens modal with `重新挑战`; completing level 3 opens final completion modal without `下一关`

  **QA Scenarios**:
  ```
  Scenario: Idle controls transition into gameplay
    Tool: Playwright
    Steps: Open the app; assert a visible button labeled "开始挑战"; click it.
    Expected: Store enters `playing`, board appears active, and attempts display shows `3` on level 1.
    Evidence: .sisyphus/evidence/task-4-controls-start.png

  Scenario: Final level does not show next-level CTA
    Tool: Playwright
    Steps: Use store actions to set up a near-win state for level 3; complete the last pair; inspect the modal.
    Expected: Modal shows completion copy and a `重新挑战` action, with no `下一关` button present.
    Evidence: .sisyphus/evidence/task-4-controls-final-modal.png
  ```

  **Commit**: NO | Message: `feat(game): add controls and modals` | Files: `src/game/components/GameControls.tsx`, `src/game/components/GameModal.tsx`

- [ ] 5. Wire gameplay flow across board, shell, and store

  **What to do**: Integrate `GameScreen`, `GameBoard`, `GameControls`, and `GameModal` into one flow. Ensure matching logic uses card value equality, mismatches restore after a short deterministic delay (use `600ms`), matches mark cards eliminated, and every completed attempt decrements remaining attempts before evaluating win/loss. On the final successful pair of a level, prefer win/completion over loss even if remaining attempts reaches `0` on that same attempt. Make restart reset the current level; make `advanceLevel` move linearly `1 → 2 → 3`; and make final completion reset to level 1 only when the user chooses `重新挑战`.
  **Must NOT do**: Do not let board rendering own business rules, do not decrement attempts on incomplete single flips, and do not allow further card interaction once modal states are active.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: cross-component orchestration with multiple edge cases and timing rules
  - Skills: `[]` - no extra skill needed if store contract is already defined
  - Omitted: `subagent-driven-development` - this is still a single cohesive integration task, not a multi-subagent execution plan

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: `6` | Blocked By: `1, 2, 3, 4`

  **References**:
  - API/Type: `src/game/config.ts` - authoritative level counts and attempts
  - API/Type: `src/game/store/useGameStore.ts` - authoritative phase/actions/history semantics
  - Pattern: `src/main.tsx:6` - overall app mount remains a single-screen SPA

  **Acceptance Criteria**:
  - [ ] Matching a pair eliminates both cards and records one undo snapshot
  - [ ] Mismatching a pair flips both cards back after `600ms`, records one undo snapshot, and decrements attempts once
  - [ ] Undo restores the exact prior card states and increments remaining attempts by one, but only from `playing`
  - [ ] Clearing all pairs on the last allowed attempt still counts as success, not failure

  **QA Scenarios**:
  ```
  Scenario: Mismatch then undo refunds the attempt
    Tool: Playwright
    Steps: Start level 1; inspect store to find two cards with different values; click their coordinates; wait for restore; note remaining attempts; click "回退".
    Expected: The board returns to the pre-attempt snapshot and remaining attempts increases by exactly 1.
    Evidence: .sisyphus/evidence/task-5-mismatch-undo.json

  Scenario: Success on final allowed attempt wins
    Tool: Playwright
    Steps: Use store actions to set a level state with one remaining matching pair and `remainingAttempts = 1`; complete that pair.
    Expected: Phase becomes `won` for levels 1-2 or `completed` for level 3; failure modal does not appear.
    Evidence: .sisyphus/evidence/task-5-final-attempt-win.json
  ```

  **Commit**: NO | Message: `feat(game): wire gameplay flow` | Files: `src/game/components/GameScreen.tsx`, `src/game/components/GameBoard.tsx`, `src/game/components/GameControls.tsx`, `src/game/components/GameModal.tsx`, `src/game/store/useGameStore.ts`

- [ ] 6. Apply final styling and deterministic QA hooks

  **What to do**: Rewrite `src/App.css` around the new game shell and minimally adjust `src/index.css` only where global layout tokens need adaptation. Add stable `data-testid` attributes to DOM controls/modal containers. Add a fixed-size board wrapper element (for example `data-testid="game-board"`) around the Pixi canvas so Playwright can locate it and compute click coordinates reliably. Ensure focus-visible states exist for all buttons and the UI works from narrow desktop widths down to tablet/mobile widths without overflow.
  **Must NOT do**: Do not reintroduce starter CSS selectors, do not rely on random class names for automated QA, and do not add decorative assets beyond CSS/Pixi shapes.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: final layout polish, responsiveness, and testability surfaces
  - Skills: `[]` - no extra skill needed
  - Omitted: `frontend-design` - no broad redesign or art direction is required

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: `F1, F2, F3, F4` | Blocked By: `1, 2, 3, 4, 5`

  **References**:
  - Pattern: `src/App.css:1` - replace old component styles wholesale rather than layering over starter selectors
  - Pattern: `src/index.css:1` - reuse existing CSS variables where practical
  - Pattern: `src/index.css:53` - keep root container width/full-height behavior coherent with the new shell

  **Acceptance Criteria**:
  - [ ] `src/App.css` no longer contains starter selectors like `.hero`, `#next-steps`, or `.counter`
  - [ ] Primary interactive DOM elements expose stable `data-testid` attributes
  - [ ] Board wrapper dimensions are stable enough for deterministic browser clicks and screenshots

  **QA Scenarios**:
  ```
  Scenario: Deterministic selectors and layout are present
    Tool: Playwright
    Steps: Open the app; query `[data-testid="game-board"]`, `[data-testid="start-button"]`, and modal/container test ids when applicable.
    Expected: Elements are present with stable selectors and the board wrapper has non-zero deterministic size.
    Evidence: .sisyphus/evidence/task-6-selectors-layout.json

  Scenario: Lint and build both pass on final UI
    Tool: Bash
    Steps: Run `npm run lint`; run `npm run build`.
    Expected: Both commands succeed with no added warnings/errors that block completion.
    Evidence: .sisyphus/evidence/task-6-lint-build.txt
  ```

  **Commit**: NO | Message: `style(game): finalize shell and qa hooks` | Files: `src/App.css`, `src/index.css`, `src/game/components/GameScreen.tsx`, `src/game/components/GameControls.tsx`, `src/game/components/GameModal.tsx`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Do not create git commits unless the user explicitly asks for them.
- If the user later requests commits, prefer one commit after Tasks `1-2`, one after Tasks `3-5`, and one after Task `6`, using conventional commit messages aligned with each task’s suggested message.

## Success Criteria
- The Vite starter page is fully replaced by a playable three-level card matching game.
- Game rules match the agreed spec exactly: pair-attempt counting, current-level restart, last-attempt success precedence, and one-step undo for completed attempts.
- The implementation uses `zustand` for authoritative state and `@pixi/react` for the board instead of plain DOM-only cards.
- No excluded scope items are added.
- `npm run lint` and `npm run build` pass, and browser automation can verify the critical game flows via stable selectors and `window.__CARD_GAME_STORE__` in dev mode.
