import World from "../game/world";
import { Vec2 } from "../utils/vectors";

export default class Particle {
  protected world: World;

  protected pos: Vec2;
  protected size: Vec2;
  protected rot: number;
  protected a: number;
  protected scale: number;
  protected opacity: number;
  protected decayIn: number;
  protected color: string;

  protected decayStart: number;

  constructor(
    world: World,
    props: {
      pos: Vec2;
      size: Vec2;
      rot: number;
      a: number;
      scale: number;
      opacity: number;
      decayIn: number;
      color?: string;
    }
  ) {
    this.world = world;
    this.pos = props.pos;
    this.size = props.size;
    this.rot = props.rot;
    this.a = props.a;
    this.scale = props.scale;
    this.opacity = props.opacity;
    this.decayIn = this.decayStart = props.decayIn;
    this.color = props.color ?? "#ffffff";
  }

  public update(dt: number): void {
    const { pos, size, rot, a, scale, opacity, decayIn, decayStart } = this;

    const rads = (rot / 180) * Math.PI;
    this.pos = [pos[0] + Math.sin(rads) * a * dt, pos[1] - Math.cos(rads) * a * dt];
    // this.scale = scale - 0.5 * dt;
    this.opacity = decayIn / decayStart;
    this.decayIn = Math.max(this.decayIn - dt, 0);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const { pos, size, rot, a, scale, opacity, color } = this;

    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], size[0] * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  public isDead(): boolean {
    return this.decayIn <= 0;
  }
}
