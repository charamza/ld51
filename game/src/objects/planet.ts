import World from "../game/world";
import { toRads } from "../utils/angles";
import { Vec2 } from "../utils/vectors";
import GameObject from "./gameObject";
import House from "./house";
import Human from "./human";
import PlanetObject from "./planetObject";
import Tree from "./tree";

type ColorSpot = {
  pos: Vec2;
  color: string;
  size: number;
};

const colorSchemas = [
  ["#A77979", "#704F4F", "#553939", "#472D2D"],
  ["#874C62", "#C98474", "#F2D388", "#A7D2CB"],
  ["#F3C892", "#FFF1BD", "#A3DA8D", "#146356"],
  ["#FCFFB2", "#B6E388", "#C7F2A4", "#E1FFB1"],
];

export default class Planet extends GameObject {
  protected color: string = "#ffffff";
  protected rotSpeed: number;
  protected _toBeDestroyed: boolean = false;

  protected colorSpots: ColorSpot[] = [];

  protected objects: PlanetObject[] = [];

  constructor(world: World, { size, ...props }: { pos: Vec2; size: number }) {
    super(world, { ...props, size: [size, size] });

    this.rotSpeed = (Math.random() * 0.5 + 0.5) * 5;

    const colorSchema = colorSchemas[Math.floor(Math.random() * colorSchemas.length)];
    this.color = colorSchema[0];

    const numSpots = Math.floor(Math.random() * 10 + 10);
    for (let i = 0; i < numSpots; i++) {
      const randomColor = colorSchema[Math.floor(Math.random() * colorSchema.length)];
      const randomSize = Math.random() * size * ((numSpots - i) / numSpots);
      this.colorSpots.push({
        pos: [Math.random() * size - size / 2, Math.random() * size - size / 2],
        color: randomColor,
        size: randomSize,
      });
    }

    this._toBeDestroyed = Math.random() < 0.1;

    this.createResidents();
  }

  public createResidents(): void {
    const scalar = Math.floor(this.size[0] / 400);
    const numTrees = Math.floor(Math.random() * 10 + 10) * scalar;
    const numHouses = Math.floor(Math.random() * 5 + 5) * scalar;
    const numResidents = Math.floor(Math.random() * 10 + 10) * scalar;

    for (let i = 0; i < 40; i++) {
      this.objects.push(new Tree(this));
    }

    for (let i = 0; i < 10; i++) {
      this.objects.push(new House(this));
    }

    for (let i = 0; i < numResidents; i++) {
      this.objects.push(new Human(this));
    }
  }

  public update(dt: number): void {
    super.update(dt);

    this.rot += this.rotSpeed * dt;

    this.objects.forEach((obj) => obj.update(dt));
  }

  public render(ctx: CanvasRenderingContext2D): void {
    super.render(ctx);

    const { pos, size, color } = this;
    const radius = size[0] / 2;

    ctx.save();

    ctx.translate(pos[0], pos[1]);
    ctx.rotate(toRads(this.rot));

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    for (const spot of this.colorSpots) {
      ctx.fillStyle = spot.color;
      ctx.beginPath();
      ctx.arc(spot.pos[0], spot.pos[1], spot.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    this.objects.forEach((obj) => obj.render(ctx));
  }

  public moveWithPlanet(gameObj: GameObject, dt: number): void {
    const { pos, size, rotSpeed } = this;
    const radius = size[0] / 2 + gameObj.getSize()[1] / 2;

    const angleToObj = this.getAngleTo(gameObj);

    const rads1 = toRads(angleToObj);
    const rads2 = toRads(angleToObj + rotSpeed * dt);
    gameObj.movePos([(Math.sin(rads2) - Math.sin(rads1)) * radius, -(Math.cos(rads2) - Math.cos(rads1)) * radius]);
    gameObj.setRot(angleToObj);
  }

  public willGetDestroyed(): boolean {
    return this._toBeDestroyed;
  }

  public getRotSpeed(): number {
    return this.rotSpeed;
  }
}
