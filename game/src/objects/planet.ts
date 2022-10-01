import World from "../game/world";
import { Vec2 } from "../utils/vectors";
import GameObject from "./gameObject";

export default class Planet extends GameObject {
  protected color: string = "#ffffff";

  constructor(world: World, { size, ...props }: { pos: Vec2; size: number; color?: string }) {
    super(world, { ...props, size: [size, size] });

    if (props.color) this.color = props.color;
  }

  public update(dt: number): void {}

  public render(ctx: CanvasRenderingContext2D): void {
    const { pos, size } = this;
    const { color } = this;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], size[0] / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
