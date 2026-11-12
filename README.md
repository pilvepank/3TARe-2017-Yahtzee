# 3TARe-2017-Yahtzee
UML skeemid:
https://creately.com/diagram/j7u8iw5l1/i5UQjyalMP2zzejc4T0H487advo%3D
https://creately.com/diagram/j7u9b8bw1/nOPbErGMo284qu9POCoyPvc0Lww%3D
## What is in this repository

| Path | What it is |
| --- | --- |
| `web-src/`, `index.html` | The playable game: Yahtzee in TypeScript + Phaser, with a CPU opponent. Scoring rules are in `web-src/game/yahtzeeRules.ts` and are covered by `web-src/__tests__`. |
| `src/ee/tthk/` | The original 2017 school project in Java (interfaces, mocks, a console `Round`). It is an unfinished scaffold, not a working game: `ScoreBoard.GetOptions` is a stub and the upper-section bonus/turn order in `Game` do not follow the rules. The TypeScript version is the maintained one. |
| `test/` | JUnit tests for the Java scaffold. |

## Running the web version

```bash
npm install
npm run dev     # local dev server
npm test        # rules tests (vitest)
npm run build   # type-check and production build
```
