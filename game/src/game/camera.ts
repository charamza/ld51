import Player from "../objects/player";
import { Vec2, Vec4 } from "../utils/vectors";
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

  public getBoundingRect(): Vec4 {
    const { canvasWidth, canvasHeight } = this.game;
    const { zoomOutInterpolated, pos } = this;

    const x = pos[0] - (canvasWidth / 2) * zoomOutInterpolated;
    const y = pos[1] - (canvasHeight / 2) * zoomOutInterpolated;

    return [x, y, x + canvasWidth * zoomOutInterpolated, y + canvasHeight * zoomOutInterpolated];
  }

  public getScreen(): Vec4 {
    const boundingRect = this.getBoundingRect();

    return [boundingRect[0], boundingRect[1], boundingRect[2] - boundingRect[0], boundingRect[3] - boundingRect[1]];
  }
}
