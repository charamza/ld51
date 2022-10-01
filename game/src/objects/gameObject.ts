import World from "../game/world";
import { addVec2, Vec2, Vec4 } from "../utils/vectors";
import GameComponent from "./gameComponent";

export default class GameObject {
  protected world: World;

  protected pos: Vec2;
  protected size: Vec2;
  protected rot: number;
  protected _delete: boolean = false;

  protected components: GameComponent[] = [];

  constructor(world: World, props: { pos: Vec2; size: Vec2 }) {
    this.world = world;
    this.pos = props.pos;
    this.size = props.size;
    this.rot = 0;
  }

  public getBoundingBox(): Vec4 {
    return [this.pos[0] - this.size[0], this.pos[1] - this.size[1], this.pos[0] + this.size[0], this.pos[1] + this.size[1]];
  }

  public getPos(): Vec2 {
    return this.pos;
  }

  public movePos(dpos: Vec2): void {
    this.pos = addVec2(this.pos, dpos);
  }

  public getSize(): Vec2 {
    return this.size;
  }

  public getRot(): number {
    return this.rot;
  }

  public setRot(rot: number): void {
    this.rot = rot;
  }

  public update(dt: number): void {
    this.components.forEach((component) => component.update(dt));
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.components.forEach((component) => component.render(ctx));
  }

  public getDistanceTo(other: GameObject): number {
    const [x1, y1] = this.pos;
    const [x2, y2] = other.pos;

    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) - (this.size[1] + other.size[1]) / 2;
  }

  public getAngleTo(other: GameObject): number {
    const [x1, y1] = this.pos;
    const [x2, y2] = other.pos;

    return ((Math.atan2(y2 - y1, x2 - x1) / Math.PI) * 180 + 90 + 360) % 360;
  }

  public delete(): void {
    this._delete = true;
  }

  public toBeDeleted(): boolean {
    return this._delete;
  }
}
