import { angleMovement, toRads } from "../utils/angles";
import { addVec2, Vec2 } from "../utils/vectors";
import GameObject from "./gameObject";
import Planet from "./planet";

export default class PlanetObject extends GameObject {
  protected planet: Planet;

  constructor(planet: Planet, { size }: { size: Vec2 }) {
    super(planet.world, { pos: [0, 0], size });
    this.planet = planet;
  }

  public update(dt: number): void {
    super.update(dt);

    this.rot += this.planet.getRotSpeed() * dt;

    this.updatePos();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    super.render(ctx);

    const { pos } = this;

    ctx.save();
    ctx.translate(pos[0], pos[1]);
    ctx.rotate(toRads(this.rot - 180));
    this.renderSprite(ctx);
    ctx.restore();
  }

  protected renderSprite(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, this.size[0], this.size[1]);
  }

  protected updatePos(): void {
    const center = this.planet.getPos();
    const radius = this.planet.getSize()[0] / 2;
    this.pos = addVec2(center, angleMovement(this.rot, radius));
  }
}
