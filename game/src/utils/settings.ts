import Game from "../game/game";

export type GraphicsLevel = "low" | "medium" | "high";

const storageGraphicsKey = "graphics";

export default class Settings {
  public graphicsLevel: GraphicsLevel = (localStorage.getItem(storageGraphicsKey) as GraphicsLevel) || "high";

  constructor(public game: Game) {}

  public changeGraphicsLevel(level: GraphicsLevel) {
    if (!this.graphicsLevel) return;
    this.graphicsLevel = level;
    this.game.restart();
    localStorage.setItem(storageGraphicsKey, level);
  }

  public get graphicsMultiplier(): number {
    switch (this.graphicsLevel) {
      case "low":
        return 1;
      case "medium":
        return 5;
      case "high":
        return 10;
    }
  }
}
