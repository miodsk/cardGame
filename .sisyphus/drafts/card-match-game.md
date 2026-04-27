# Draft: Card Match Game

## Requirements (confirmed)
- 实现对对消除小游戏
- 玩家先后点击两张卡牌；若两张相同则消除，不同则还原
- 关卡需求：第一关 4 张牌，第二关 8 张，第三关 16 张
- 提供开始挑战、重新挑战功能
- 支持翻牌次数限制
- 指定翻牌次数内全部消除则提示通关，并可进入下一关
- 翻牌次数用完仍未消除完则提示挑战失败，并可重新挑战
- 支持翻牌回退操作

## Technical Decisions
- 目标技术栈已确认存在：React + TypeScript + Vite + `@pixi/react` + `pixi.js`
- 用户已安装 `zustand`，状态管理采用 `zustand`
- 先基于现有仓库做增量设计，不引入额外框架作为前置假设
- 翻牌次数按“每完成 1 次两张配对尝试”计数
- 回退操作定义为：撤销最近一次完整配对尝试（含翻开、消除/还原结果）
- 本次不新增测试框架；验证策略以 `npm run lint`、`npm run build` 与浏览器手工验收为主
- 渲染方案采用混合模式：Pixi 负责卡牌棋盘，React DOM 负责按钮、关卡提示、通关/失败弹层
- 关卡翻牌次数上限：第 1 关 3 次、第 2 关 6 次、第 3 关 12 次

## Research Findings
- `package.json`: 当前仓库已安装 `@pixi/react`、`pixi.js`、`react`、`vite`
- 用户补充：已安装 `zustand`
- `package.json`: 当前脚本仅有 `dev`、`build`、`lint`，暂未看到 `test`
- 仓库根目录暂无 `AGENTS.md`
- 项目暂无 Jest/Vitest/Playwright 配置，也暂无 CI 配置
- `src/` 当前结构极简：`main.tsx`、`App.tsx`、`App.css`、`index.css`、`assets/`
- 当前无路由、无状态管理库、无现成游戏模块，适合首版直接在 `src/` 下新增游戏相关目录

## Open Questions
- 是否需要记分、计时、动画、音效、移动端适配

## Scope Boundaries
- INCLUDE: 核心翻牌/配对/消除、三关卡、开始/重开、通关/失败提示、翻牌次数、回退
- EXCLUDE: 联网、账号、排行榜、支付、复杂剧情系统、分数系统、计时系统、音效、额外动画需求
