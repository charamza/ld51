import GameObject from "./gameobject";

export default class GameComponent {
  protected gameObject: GameObject;

  constructor(gameObject: GameObject) {
    this.gameObject = gameObject;
  }

  public update(dt: number): void {}

  public render(ctx: CanvasRenderingContext2D): void {}
}
