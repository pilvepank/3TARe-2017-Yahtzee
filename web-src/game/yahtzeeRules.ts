export type ScoreCategory =
  | "Ones"
  | "Twos"
  | "Threes"
  | "Fours"
  | "Fives"
  | "Sixes"
  | "ThreeOfAKind"
  | "FourOfAKind"
  | "FullHouse"
  | "SmallStraight"
  | "LongStraight"
  | "Yahtzee"
  | "Chance";

export const UPPER_CATEGORIES: ScoreCategory[] = [
  "Ones",
  "Twos",
  "Threes",
  "Fours",
  "Fives",
  "Sixes",
];

export const LOWER_CATEGORIES: ScoreCategory[] = [
  "ThreeOfAKind",
  "FourOfAKind",
  "FullHouse",
  "SmallStraight",
  "LongStraight",
  "Yahtzee",
  "Chance",
];

export const ALL_CATEGORIES: ScoreCategory[] = [
  ...UPPER_CATEGORIES,
  ...LOWER_CATEGORIES,
];

export const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  Ones: "Ones (1s)",
  Twos: "Twos (2s)",
  Threes: "Threes (3s)",
  Fours: "Fours (4s)",
  Fives: "Fives (5s)",
  Sixes: "Sixes (6s)",
  ThreeOfAKind: "Three of a Kind",
  FourOfAKind: "Four of a Kind",
  FullHouse: "Full House",
  SmallStraight: "Small Straight",
  LongStraight: "Long Straight",
  Yahtzee: "Yahtzee",
  Chance: "Chance",
};

export interface PlayerScorecard {
  name: string;
  isCpu: boolean;
  scores: Partial<Record<ScoreCategory, number>>;
  yahtzeeBonus: number;
}

export function createScorecard(name: string, isCpu = false): PlayerScorecard {
  return { name, isCpu, scores: {}, yahtzeeBonus: 0 };
}

export function countFaces(dice: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const d of dice) {
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return counts;
}

export function calculateCategoryScore(category: ScoreCategory, dice: number[]): number {
  if (dice.length !== 5) return 0;
  const sum = dice.reduce((a, b) => a + b, 0);
  const counts = countFaces(dice);
  const freqs = Array.from(counts.values()).sort((a, b) => b - a);
  const uniqueSorted = Array.from(counts.keys()).sort((a, b) => a - b);

  switch (category) {
    case "Ones":
      return (counts.get(1) ?? 0) * 1;
    case "Twos":
      return (counts.get(2) ?? 0) * 2;
    case "Threes":
      return (counts.get(3) ?? 0) * 3;
    case "Fours":
      return (counts.get(4) ?? 0) * 4;
    case "Fives":
      return (counts.get(5) ?? 0) * 5;
    case "Sixes":
      return (counts.get(6) ?? 0) * 6;
    case "ThreeOfAKind":
      return freqs[0] >= 3 ? sum : 0;
    case "FourOfAKind":
      return freqs[0] >= 4 ? sum : 0;
    case "FullHouse":
      return (freqs[0] === 3 && freqs[1] === 2) || freqs[0] === 5 ? 25 : 0;
    case "SmallStraight": {
      const joined = uniqueSorted.join("");
      return joined.includes("1234") || joined.includes("2345") || joined.includes("3456")
        ? 30
        : 0;
    }
    case "LongStraight": {
      const joined = uniqueSorted.join("");
      return joined === "12345" || joined === "23456" ? 40 : 0;
    }
    case "Yahtzee":
      return freqs[0] === 5 ? 50 : 0;
    case "Chance":
      return sum;
  }
}

export function isYahtzee(dice: number[]): boolean {
  return dice.length === 5 && new Set(dice).size === 1;
}

export function getUpperSum(card: PlayerScorecard): number {
  return UPPER_CATEGORIES.reduce((acc, cat) => acc + (card.scores[cat] ?? 0), 0);
}

export function getUpperBonus(card: PlayerScorecard): number {
  return getUpperSum(card) >= 63 ? 35 : 0;
}

export function getLowerSum(card: PlayerScorecard): number {
  return LOWER_CATEGORIES.reduce((acc, cat) => acc + (card.scores[cat] ?? 0), 0);
}

export function getTotalScore(card: PlayerScorecard): number {
  return getUpperSum(card) + getUpperBonus(card) + getLowerSum(card) + card.yahtzeeBonus;
}

export function isCardComplete(card: PlayerScorecard): boolean {
  return ALL_CATEGORIES.every((cat) => card.scores[cat] !== undefined);
}

export function chooseCpuCategory(card: PlayerScorecard, dice: number[]): ScoreCategory {
  const available = ALL_CATEGORIES.filter((cat) => card.scores[cat] === undefined);
  let bestCat = available[0];
  let bestScore = -1;
  for (const cat of available) {
    const score = calculateCategoryScore(cat, dice);
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }
  return bestCat;
}

export function chooseCpuHolds(dice: number[]): boolean[] {
  const counts = countFaces(dice);
  let targetFace = dice[0];
  let maxFreq = 0;
  for (const [face, freq] of counts.entries()) {
    if (freq > maxFreq || (freq === maxFreq && face > targetFace)) {
      maxFreq = freq;
      targetFace = face;
    }
  }
  if (maxFreq >= 2) {
    return dice.map((d) => d === targetFace);
  }
  return dice.map((d) => d >= 5);
}
