import "./styles.css";
import Phaser from "phaser";
import { YahtzeeScene } from "./game/YahtzeeScene";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  LOWER_CATEGORIES,
  UPPER_CATEGORIES,
  calculateCategoryScore,
  chooseCpuCategory,
  chooseCpuHolds,
  createScorecard,
  getLowerSum,
  getTotalScore,
  getUpperBonus,
  getUpperSum,
  isCardComplete,
  isYahtzee,
  type PlayerScorecard,
  type ScoreCategory,
} from "./game/yahtzeeRules";

type GameMode = "cpu" | "2p" | "solo";

let mode: GameMode = "cpu";
let players: PlayerScorecard[] = [];
let activeIdx = 0;
let dice = [1, 2, 3, 4, 5];
let held = [false, false, false, false, false];
let rollsLeft = 3;
let hasRolled = false;
let gameOver = false;

const modeSelect = document.getElementById("mode-select") as HTMLSelectElement;
const newGameBtn = document.getElementById("new-game-btn") as HTMLButtonElement;
const rollBtn = document.getElementById("roll-btn") as HTMLButtonElement;
const turnLabel = document.getElementById("turn-label") as HTMLElement;
const rollsLeftEl = document.getElementById("rolls-left") as HTMLElement;
const statusBanner = document.getElementById("status-banner") as HTMLElement;
const scorecardContainer = document.getElementById("scorecard-container") as HTMLElement;

const scene = new YahtzeeScene({
  onDieToggle: (index: number) => {
    if (!hasRolled || rollsLeft === 0 || gameOver || players[activeIdx]?.isCpu) return;
    held[index] = !held[index];
    scene.syncState(dice, held, true, false);
  },
});

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "phaser-container",
  width: 640,
  height: 240,
  backgroundColor: "#022c22",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [scene],
});

function randomDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function rollDice(animate = true): void {
  if (rollsLeft <= 0 || gameOver) return;
  dice = dice.map((v, i) => (held[i] ? v : randomDie()));
  rollsLeft -= 1;
  hasRolled = true;
  scene.syncState(dice, held, rollsLeft > 0 && !players[activeIdx].isCpu, animate);
  renderUI();
}

function selectCategory(cat: ScoreCategory): void {
  const player = players[activeIdx];
  if (!hasRolled || gameOver || player.scores[cat] !== undefined) return;

  if (isYahtzee(dice) && (player.scores.Yahtzee ?? 0) === 50 && cat !== "Yahtzee") {
    player.yahtzeeBonus += 100;
  }
  player.scores[cat] = calculateCategoryScore(cat, dice);

  if (players.every(isCardComplete)) {
    gameOver = true;
    const sorted = [...players].sort((a, b) => getTotalScore(b) - getTotalScore(a));
    const winnerText =
      players.length === 1
        ? `Game complete! Final Score: ${getTotalScore(sorted[0])}`
        : `Game over! Winner: ${sorted[0].name} (${getTotalScore(sorted[0])} pts)`;
    statusBanner.textContent = winnerText;
    statusBanner.classList.remove("hidden");
    scene.syncState(dice, [false, false, false, false, false], false, false);
    renderUI();
    return;
  }

  activeIdx = (activeIdx + 1) % players.length;
  rollsLeft = 3;
  hasRolled = false;
  held = [false, false, false, false, false];
  scene.syncState(dice, held, false, false);
  renderUI();

  if (players[activeIdx].isCpu) {
    runCpuTurn();
  }
}

function runCpuTurn(): void {
  const cpuStep = () => {
    if (gameOver || !players[activeIdx]?.isCpu) return;
    rollDice(true);
    if (rollsLeft > 0) {
      held = chooseCpuHolds(dice);
      scene.syncState(dice, held, false, false);
      setTimeout(cpuStep, 450);
    } else {
      setTimeout(() => {
        const cat = chooseCpuCategory(players[activeIdx], dice);
        selectCategory(cat);
      }, 450);
    }
  };
  setTimeout(cpuStep, 400);
}

function renderScorecard(): void {
  const active = players[activeIdx];
  const headerCols = players
    .map(
      (p, i) =>
        `<th class="px-2 py-2 text-right font-semibold ${
          i === activeIdx && !gameOver ? "text-amber-400" : "text-slate-300"
        }">${p.name}</th>`
    )
    .join("");

  const renderRows = (cats: ScoreCategory[]) =>
    cats
      .map((cat) => {
        const cells = players
          .map((p, idx) => {
            const val = p.scores[cat];
            if (val !== undefined) {
              return `<td class="px-2 py-1.5 text-right font-mono text-sm text-slate-200">${val}</td>`;
            }
            if (idx === activeIdx && hasRolled && !p.isCpu && !gameOver) {
              const preview = calculateCategoryScore(cat, dice);
              return `<td class="px-2 py-1 text-right">
                <button data-cat="${cat}" class="score-pick rounded bg-emerald-600/30 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/50 hover:bg-emerald-500 hover:text-slate-950">
                  +${preview}
                </button>
              </td>`;
            }
            return `<td class="px-2 py-1.5 text-right font-mono text-xs text-slate-600">-</td>`;
          })
          .join("");
        return `<tr class="border-b border-slate-800/80 hover:bg-slate-800/40">
          <td class="py-1.5 pr-2 text-sm text-slate-300">${CATEGORY_LABELS[cat]}</td>
          ${cells}
        </tr>`;
      })
      .join("");

  const summaryRow = (label: string, fn: (p: PlayerScorecard) => string, accent = "text-slate-200") =>
    `<tr class="border-b border-slate-800 bg-slate-950/50 font-semibold">
      <td class="py-1.5 pr-2 text-xs uppercase tracking-wider text-slate-400">${label}</td>
      ${players.map((p) => `<td class="px-2 py-1.5 text-right font-mono text-sm ${accent}">${fn(p)}</td>`).join("")}
    </tr>`;

  scorecardContainer.innerHTML = `
    <table class="w-full border-collapse text-left">
      <thead>
        <tr class="border-b border-slate-700 text-xs uppercase tracking-wider">
          <th class="py-2 pr-2 text-slate-400">Category (${ALL_CATEGORIES.length})</th>
          ${headerCols}
        </tr>
      </thead>
      <tbody>
        ${renderRows(UPPER_CATEGORIES)}
        ${summaryRow("Upper Sum", (p) => `${getUpperSum(p)} / 63`)}
        ${summaryRow("Upper Bonus (+35)", (p) => `${getUpperBonus(p)}`, "text-emerald-400")}
        ${renderRows(LOWER_CATEGORIES)}
        ${summaryRow("Lower Sum", (p) => `${getLowerSum(p)}`)}
        ${summaryRow("Total", (p) => `${getTotalScore(p)}`, "text-amber-400 font-bold")}
      </tbody>
    </table>
  `;

  scorecardContainer.querySelectorAll<HTMLButtonElement>("button.score-pick").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat as ScoreCategory | undefined;
      if (cat && active && !active.isCpu) {
        selectCategory(cat);
      }
    });
  });
}

function renderUI(): void {
  const active = players[activeIdx];
  turnLabel.textContent = gameOver ? "Game Over" : active.name;
  rollsLeftEl.textContent = String(rollsLeft);
  rollBtn.disabled = gameOver || rollsLeft <= 0 || Boolean(active?.isCpu);
  renderScorecard();
}

function startNewGame(): void {
  mode = modeSelect.value as GameMode;
  if (mode === "cpu") {
    players = [createScorecard("Player 1"), createScorecard("CPU", true)];
  } else if (mode === "2p") {
    players = [createScorecard("Player 1"), createScorecard("Player 2")];
  } else {
    players = [createScorecard("Player 1")];
  }
  activeIdx = 0;
  dice = [1, 2, 3, 4, 5];
  held = [false, false, false, false, false];
  rollsLeft = 3;
  hasRolled = false;
  gameOver = false;
  statusBanner.classList.add("hidden");
  scene.syncState(dice, held, false, false);
  renderUI();
}

rollBtn.addEventListener("click", () => rollDice(true));
newGameBtn.addEventListener("click", startNewGame);
modeSelect.addEventListener("change", startNewGame);

startNewGame();
