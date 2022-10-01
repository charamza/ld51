import Game from "./game";

export default class GUI {
  private elGameOverScreen: HTMLElement = document.getElementById("gameOverScreen");
  private elGameOverBtn: HTMLElement = document.getElementById("restartButton");
  private elStartScreen: HTMLElement = document.getElementById("startScreen");
  private elStartBtn: HTMLElement = document.getElementById("startButton");

  constructor(protected game: Game) {
    this.initGameStartScreen();
    this.initGameOverScreen();
  }

  private initGameStartScreen(): void {
    this.elStartBtn.addEventListener("click", () => {
      this.game.start();
      this.elStartScreen.classList.remove("show");
    });
  }

  private initGameOverScreen(): void {
    this.elGameOverBtn.addEventListener("click", () => {
      this.game.restart();
      this.elGameOverScreen.classList.remove("show");
    });
  }

  public showGameOverScreen(): void {
    this.elGameOverScreen.classList.add("show");
    this.elGameOverBtn.focus();
  }
}
