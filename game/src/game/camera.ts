import GameObject from "../objects/gameObject";
import { Vec2 } from "../utils/vectors";
import Game from "./game";

export default class Camera {
  protected pos: Vec2;
  protected focusedObject: GameObject | null = null;

  public focusObject(obj: GameObject) {
    this.focusedObject = obj;
  }

  constructor(protected game: Game) {
    this.pos = [0, 0];
  }

  public update(dt: number): void {
    if (this.focusedObject) {
      this.pos = this.focusedObject.getPos();
    }
  }

  public translateContext(ctx: CanvasRenderingContext2D): void {
    ctx.translate(-this.pos[0] + this.game.canvasWidth / 2, -this.pos[1] + this.game.canvasHeight / 2);
  }
}
