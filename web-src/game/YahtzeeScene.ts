import Phaser from "phaser";

const PIP_LAYOUTS: Record<number, Array<[number, number]>> = {
  1: [[0, 0]],
  2: [
    [-18, -18],
    [18, 18],
  ],
  3: [
    [-18, -18],
    [0, 0],
    [18, 18],
  ],
  4: [
    [-18, -18],
    [18, -18],
    [-18, 18],
    [18, 18],
  ],
  5: [
    [-18, -18],
    [18, -18],
    [0, 0],
    [-18, 18],
    [18, 18],
  ],
  6: [
    [-18, -18],
    [18, -18],
    [-18, 0],
    [18, 0],
    [-18, 18],
    [18, 18],
  ],
};

export interface SceneHooks {
  onDieToggle: (index: number) => void;
}

export class YahtzeeScene extends Phaser.Scene {
  private diceContainers: Phaser.GameObjects.Container[] = [];
  private holdBadges: Phaser.GameObjects.Text[] = [];
  private diceValues: number[] = [1, 2, 3, 4, 5];
  private held: boolean[] = [false, false, false, false, false];
  private canHold = false;
  private hooks: SceneHooks;

  constructor(hooks: SceneHooks) {
    super({ key: "YahtzeeScene" });
    this.hooks = hooks;
  }

  create(): void {
    const { width, height } = this.scale;
    const felt = this.add.graphics();
    felt.fillStyle(0x064e3b, 1);
    felt.fillRoundedRect(12, 12, width - 24, height - 24, 18);
    felt.lineStyle(3, 0x10b981, 0.45);
    felt.strokeRoundedRect(12, 12, width - 24, height - 24, 18);

    this.add
      .text(width / 2, 34, "3TARe YAHTZEE TABLE", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#6ee7b7",
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    const spacing = 112;
    const startX = width / 2 - spacing * 2;
    const centerY = height / 2 + 6;

    for (let i = 0; i < 5; i++) {
      const container = this.add.container(startX + i * spacing, centerY);
      container.setSize(84, 84);
      container.setInteractive({ useHandCursor: true });
      container.on("pointerdown", () => {
        if (this.canHold) {
          this.hooks.onDieToggle(i);
        }
      });

      const badge = this.add
        .text(startX + i * spacing, centerY + 58, "HELD", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#fbbf24",
          backgroundColor: "#451a03",
          padding: { x: 6, y: 2 },
        })
        .setOrigin(0.5)
        .setVisible(false);

      this.diceContainers.push(container);
      this.holdBadges.push(badge);
    }

    this.renderAllDice();
  }

  public syncState(values: number[], held: boolean[], canHold: boolean, animateRoll: boolean): void {
    this.diceValues = [...values];
    this.held = [...held];
    this.canHold = canHold;

    if (!this.scene.isActive()) return;

    this.renderAllDice();
    if (animateRoll) {
      this.diceContainers.forEach((container, idx) => {
        if (!this.held[idx]) {
          container.setScale(0.75);
          container.setAngle(-18);
          this.tweens.add({
            targets: container,
            scale: 1,
            angle: 0,
            duration: 240,
            ease: "Back.Out",
          });
        }
      });
    }
  }

  private renderAllDice(): void {
    for (let i = 0; i < this.diceContainers.length; i++) {
      const container = this.diceContainers[i];
      const badge = this.holdBadges[i];
      if (!container) continue;

      container.removeAll(true);
      const isHeld = this.held[i];

      const gfx = this.add.graphics();
      gfx.fillStyle(isHeld ? 0xfef3c7 : 0xf8fafc, 1);
      gfx.fillRoundedRect(-40, -40, 80, 80, 14);
      gfx.lineStyle(isHeld ? 4 : 2, isHeld ? 0xf59e0b : 0x334155, 1);
      gfx.strokeRoundedRect(-40, -40, 80, 80, 14);

      const pips = PIP_LAYOUTS[this.diceValues[i]] ?? PIP_LAYOUTS[1];
      gfx.fillStyle(0x0f172a, 1);
      for (const [px, py] of pips) {
        gfx.fillCircle(px, py, 6.5);
      }

      container.add(gfx);
      if (badge) {
        badge.setVisible(isHeld);
      }
    }
  }
}
