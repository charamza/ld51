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

  public renderEnteringInterstellarBack(ctx: CanvasRenderingContext2D): void {
    const screen = this.game.camera.getScreen();
    ctx.fillStyle = "rgba(255, 64, 64, 0.5)";
    ctx.fillRect(...screen);
  }

  public renderEnteringInterstellarFront(ctx: CanvasRenderingContext2D): void {
    const screen = this.game.camera.getScreen();
    ctx.fillStyle = "white";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Entering Interstellar Space", screen[0] + screen[2] / 2, screen[1] + screen[3] / 2 + 128);
    ctx.font = "bold 30px Arial";
    ctx.fillText("Please return back", screen[0] + screen[2] / 2, screen[1] + screen[3] / 2 + 192);
  }
}
