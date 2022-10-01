import Player from "../objects/player";
import { Vec2 } from "../utils/vectors";
import Game from "./game";

export default class Camera {
  protected pos: Vec2;
  protected focusedObject: Player | null = null;
  protected zoomOut: number = 3;
  protected zoomOutInterpolated: number = 3;

  public focusObject(obj: Player) {
    this.focusedObject = obj;
  }

  constructor(protected game: Game) {
    this.pos = [0, 0];
  }

  public update(dt: number): void {
    if (this.focusedObject) {
      this.pos = this.focusedObject.getPos();
      this.zoomOut = Math.max(1, Math.sqrt(Math.abs(this.focusedObject.getAcceleration())) / 2);
      console.log(this.focusedObject.getAcceleration());
    }

    if (this.zoomOutInterpolated < this.zoomOut) {
      this.zoomOutInterpolated = Math.min(this.zoomOutInterpolated + dt * 2, this.zoomOut);
    } else {
      this.zoomOutInterpolated = Math.max(this.zoomOutInterpolated - dt * 2, this.zoomOut);
    }
  }

  public translateContext(ctx: CanvasRenderingContext2D): void {
    const scale = 1 / this.zoomOutInterpolated;
    ctx.translate(
      -this.pos[0] / this.zoomOutInterpolated + (this.game.canvasWidth / 2) * 1,
      -this.pos[1] / this.zoomOutInterpolated + (this.game.canvasHeight / 2) * 1
    );
    ctx.scale(scale, scale);
  }
}
