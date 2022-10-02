import Planet from "../objects/planet";
import Player from "../objects/player";
import { FONT_NAME } from "../utils/consts";
import { Vec2 } from "../utils/vectors";
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

    let text = "Try to rescue people by safely landing on planets with backward movement.";

    if (this.game.score.rescuedPeople > 0 || this.game.score.killedPeople > 0) {
      text = "You ";

      if (this.game.score.rescuedPeople > 0) {
        text += "rescued " + this.game.score.rescuedPeople + " people";
        if (this.game.score.killedPeople > 0) text += " and ";
      }
      if (this.game.score.killedPeople > 0) {
        text += "killed " + this.game.score.killedPeople + " people";
      }

      text += ".";
    }

    document.querySelector("#gameOverScreen .description").innerHTML = text;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.game.playing) {
      this.renderMinimap(ctx);
      this.renderScore(ctx);
    }
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

  private renderMinimap(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const width = 200;
    const height = 200;
    const x = this.game.canvasWidth - width - 10;
    const y = 10;

    ctx.fillStyle = "white";
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);

    const posToMinimapPos = (pos: Vec2): Vec2 => {
      return [pos[0] / this.game.world.mapRadius, pos[1] / this.game.world.mapRadius];
    };

    const objs = this.game.world.getObjects();

    objs.forEach((obj) => {
      const pos = posToMinimapPos(obj.getPos());

      let color;
      if (obj instanceof Player) color = "#008cff";
      else if (obj instanceof Planet) {
        if (obj.willGetDestroyed()) color = "#d6001d";
        else color = "white";
      } else {
        // Only render planets and player
        return;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + width / 2 + (pos[0] * width) / 2, y + height / 2 + (pos[1] * height) / 2, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();
  }

  private renderScore(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.fillStyle = "white";
    ctx.font = `bold 18px ${FONT_NAME}`;
    ctx.textAlign = "right";
    ctx.fillText("Rescued people:  ".toUpperCase() + this.game.score.rescuedPeople, this.game.canvasWidth - 14, 50 + 200);

    if (this.game.score.killedPeople > 0) {
      ctx.fillStyle = "white";
      ctx.fillText("Killed people:  ".toUpperCase() + this.game.score.killedPeople, this.game.canvasWidth - 14, 50 + 200 + 30);
    }

    ctx.restore();
  }
}
