import { describe, expect, it } from "vitest";
import {
  calculateCategoryScore,
  chooseCpuCategory,
  chooseCpuHolds,
  createScorecard,
  getTotalScore,
  getUpperBonus,
} from "../game/yahtzeeRules";

describe("yahtzeeRules", () => {
  it("scores upper section faces accurately", () => {
    expect(calculateCategoryScore("Ones", [1, 1, 3, 4, 1])).toBe(3);
    expect(calculateCategoryScore("Sixes", [6, 6, 6, 2, 1])).toBe(18);
  });

  it("scores three and four of a kind", () => {
    expect(calculateCategoryScore("ThreeOfAKind", [4, 4, 4, 2, 5])).toBe(19);
    expect(calculateCategoryScore("ThreeOfAKind", [1, 2, 3, 4, 5])).toBe(0);
    expect(calculateCategoryScore("FourOfAKind", [5, 5, 5, 5, 2])).toBe(22);
  });

  it("scores full house and straights", () => {
    expect(calculateCategoryScore("FullHouse", [3, 3, 3, 2, 2])).toBe(25);
    expect(calculateCategoryScore("FullHouse", [3, 3, 2, 1, 2])).toBe(0);
    // Five of a kind is accepted as a full house (Joker-style house rule of this implementation).
    expect(calculateCategoryScore("FullHouse", [4, 4, 4, 4, 4])).toBe(25);
    expect(calculateCategoryScore("SmallStraight", [1, 2, 3, 4, 6])).toBe(30);
    expect(calculateCategoryScore("LongStraight", [2, 3, 4, 5, 6])).toBe(40);
    expect(calculateCategoryScore("LongStraight", [1, 2, 3, 4, 6])).toBe(0);
  });

  it("scores yahtzee and chance", () => {
    expect(calculateCategoryScore("Yahtzee", [6, 6, 6, 6, 6])).toBe(50);
    expect(calculateCategoryScore("Chance", [1, 2, 3, 4, 6])).toBe(16);
  });

  it("awards +35 upper bonus when upper sum >= 63", () => {
    const card = createScorecard("P1");
    card.scores = { Ones: 3, Twos: 6, Threes: 9, Fours: 12, Fives: 15, Sixes: 18 };
    expect(getUpperBonus(card)).toBe(35);
    expect(getTotalScore(card)).toBe(98);
  });

  it("picks highest-scoring available CPU category and sensible holds", () => {
    const card = createScorecard("CPU", true);
    expect(chooseCpuCategory(card, [5, 5, 5, 5, 5])).toBe("Yahtzee");
    expect(chooseCpuHolds([4, 4, 1, 2, 6])).toEqual([true, true, false, false, false]);
  });
});
