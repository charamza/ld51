import Player from "../objects/player";
import { Vec2, Vec4 } from "../utils/vectors";
import Game from "./game";

export default class Camera {
  protected pos: Vec2;
  protected focusedObject: Player | null = null;
  protected zoomOut: number = 3;
  protected zoomOutInterpolated: number = 3;
  protected pixelDensityScale = 1;

  public focusObject(obj: Player) {
    this.focusedObject = obj;
  }

  constructor(protected game: Game) {
    this.pos = [0, 0];
  }

  public get zoomScale(): number {
    return this.zoomOutInterpolated * this.pixelDensityScale;
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
    const scale = 1 / this.zoomScale;
    ctx.translate(
      -this.pos[0] / this.zoomScale + (this.game.canvasWidth / 2) * 1,
      -this.pos[1] / this.zoomScale + (this.game.canvasHeight / 2) * 1
    );
    ctx.scale(scale, scale);
  }

  public getBoundingRect(): Vec4 {
    const { canvasWidth, canvasHeight } = this.game;
    const { zoomScale, pos } = this;

    const x = pos[0] - (canvasWidth / 2) * zoomScale;
    const y = pos[1] - (canvasHeight / 2) * zoomScale;

    return [x, y, x + canvasWidth * zoomScale, y + canvasHeight * zoomScale];
  }

  public getScreen(): Vec4 {
    const boundingRect = this.getBoundingRect();

    return [boundingRect[0], boundingRect[1], boundingRect[2] - boundingRect[0], boundingRect[3] - boundingRect[1]];
  }

  public setZoomOut(zoomOut: number): void {
    this.zoomOut = zoomOut;
  }

  public onResize(): void {
    this.pixelDensityScale = 1920 / this.game.canvasWidth;
  }
}
