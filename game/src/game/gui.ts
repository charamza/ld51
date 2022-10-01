import Game from "./game";

export default class GUI {
  private elGameOverScreen: HTMLElement = document.getElementById("gameOverScreen");

  constructor(protected game: Game) {
    this.initGameOverScreen();
  }

  private initGameOverScreen(): void {
    const btn = document.getElementById("restartButton");
    btn.addEventListener("click", () => {
      this.game.restart();
      this.elGameOverScreen.classList.remove("show");
    });
  }

  public showGameOverScreen(): void {
    this.elGameOverScreen.classList.add("show");
  }
}
