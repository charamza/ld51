import Game from "../game/game";

export type GraphicsLevel = "low" | "medium" | "high";

const storageGraphicsKey = "graphics";

let storage: Storage;
if (import.meta.env.VITE_DISABLE_STORAGE === "true") {
  storage = {
    getItem: (key: string) => null,
    setItem: (key: string, val: string) => {},
    clear: () => {},
    length: 0,
    key: (index: number) => null,
    removeItem: (key: string) => {},
  };
} else {
  storage = window.localStorage;
}

export default class Settings {
  public graphicsLevel: GraphicsLevel = (storage.getItem(storageGraphicsKey) as GraphicsLevel) || "high";

  constructor(public game: Game) {}

  public changeGraphicsLevel(level: GraphicsLevel) {
    if (!this.graphicsLevel) return;
    this.graphicsLevel = level;
    this.game.restart();
    storage.setItem(storageGraphicsKey, level);
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
