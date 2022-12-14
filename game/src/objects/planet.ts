import World from "../game/world";
import ExplosionParticle from "../particles/explosionParticle";
import ImplosionParticle from "../particles/ImplosionParticle";
import { angleMovement, toRads } from "../utils/angles";
import { hexColorToRgb } from "../utils/colors";
import { lerp, Vec2, Vec3 } from "../utils/vectors";
import GameObject from "./gameObject";
import House from "./house";
import Human from "./human";
import PlanetObject from "./planetObject";
import Player from "./player";
import Tree from "./tree";

type ColorSpot = {
  pos: Vec2;
  color: string;
  size: number;
};

type EmergingSpot = {
  angle: Vec2;
  size: Vec2;
  color: Vec3;
  offset: number;
};

const colorSchemas = [
  ["#A77979", "#704F4F", "#553939", "#472D2D"],
  ["#874C62", "#C98474", "#F2D388", "#A7D2CB"],
  ["#F3C892", "#FFF1BD", "#A3DA8D", "#146356"],
  ["#FCFFB2", "#B6E388", "#C7F2A4", "#E1FFB1"],
];

const heatColors: Vec3[] = [
  [235, 64, 52],
  [235, 64, 52],
  [155, 36, 1],
];

const DoomsdayInMillis = 12 * 1000;
const DoomsdayLatencyInMillis = 1 * 1000;

const PlanetEmergingInMillis = 5 * 1000;
const PlanetEmergingLatencyInMillis = 1 * 1000;
const PlanetMaxBuildTimeInMillis = 20 * 1000;

export default class Planet extends GameObject {
  protected color: string = "#ffffff";
  protected rotSpeed: number;
  protected _playerOnPlanet: number | null = null;

  protected _isEmerging = false;
  protected _emergingEnd: number | null = null;
  protected _doomsdayEnd: number | null = null;

  protected colorSpots: ColorSpot[] = [];
  protected emergingSpots: EmergingSpot[] = [];

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
  }

  public createResidents(emerging: boolean = false): void {
    const scalar = this.size[0] / 4000;
    const numTrees = Math.floor((Math.random() * 10 + 10) * scalar * this.world.game.settings.graphicsMultiplier);
    const numHouses = Math.floor((Math.random() * 5 + 5) * scalar * this.world.game.settings.graphicsMultiplier);
    const numResidents = Math.floor((Math.random() * 100 + 100) * scalar);

    const createObject = (creator: () => PlanetObject) => {
      const create = () => {
        const obj = creator();
        this.objects.push(obj);
        obj.update(0);
      };

      if (emerging) {
        setTimeout(create, Math.random() * PlanetMaxBuildTimeInMillis + PlanetEmergingLatencyInMillis);
      } else {
        create();
      }
    };

    for (let i = 0; i < numTrees; i++) {
      createObject(() => new Tree(this));
    }

    for (let i = 0; i < numHouses; i++) {
      createObject(() => new House(this));
    }

    for (let i = 0; i < numResidents; i++) {
      createObject(() => new Human(this));
    }
  }

  public update(dt: number): void {
    super.update(dt);

    if (this._doomsdayEnd !== null && Date.now() > this._doomsdayEnd + DoomsdayLatencyInMillis) {
      this.destroyPlanet();
    }

    if (this.isEmerging()) {
      const progress = this.getEmergingProgress();
      if (progress >= 1) {
        this.endEmerging();
      }
    }

    this.rot += this.rotSpeed * dt;

    if (this.isVisible()) {
      this.objects.forEach((obj) => obj.update(dt));
      this.objects = this.objects.filter((obj) => !obj.toBeDeleted());
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    super.render(ctx);

    const emergingProgress = this.getEmergingProgress();

    if (emergingProgress < 1) {
      this.renderEmerging(ctx);

      ctx.globalAlpha = Math.max((emergingProgress - 0.75) * 4, 0);
    }

    this.renderPlanet(ctx);

    this.objects.forEach((obj) => obj.render(ctx));

    this.renderDoomsday(ctx);

    ctx.globalAlpha = 1;
  }

  private renderPlanet(ctx: CanvasRenderingContext2D): void {
    const { pos, size, color } = this;
    const radius = size[0] / 2;

    ctx.save();

    ctx.translate(pos[0], pos[1]);
    ctx.rotate(toRads(this.rot));

    ctx.fillStyle = color;
    const graphicsLevel = this.world.game.settings.graphicsLevel;

    if (graphicsLevel !== "low") {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    if (graphicsLevel !== "low") {
      for (const spot of this.colorSpots) {
        ctx.fillStyle = spot.color;
        ctx.beginPath();
        ctx.arc(spot.pos[0], spot.pos[1], spot.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (graphicsLevel === "high") {
      const gradient = ctx.createRadialGradient(0, 0, radius / 2, 0, 0, radius);

      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(0.9, "rgba(0,0,0,0.3)");
      gradient.addColorStop(1, "rgba(0,0,0,0.2)");

      ctx.fillStyle = gradient;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    }

    ctx.restore();
  }

  private renderEmerging(ctx: CanvasRenderingContext2D): void {
    const progress = this.getEmergingProgress();

    const { pos, size } = this;
    const radius = (size[0] / 2) * progress;

    ctx.save();

    ctx.translate(...pos);
    ctx.rotate(toRads(this.rot));

    ctx.beginPath();
    ctx.arc(0, 0, size[0] / 2, 0, Math.PI * 2);
    ctx.clip();

    for (let i = 0; i < this.emergingSpots.length; i++) {
      const spot = this.emergingSpots[i];
      const heatColor = heatColors[Math.floor((heatColors.length * i) / this.emergingSpots.length)];
      const rgb = spot.color.map((c, i) => lerp(heatColor[i], c, progress)).join(",");
      ctx.fillStyle = `rgba(${rgb},${progress * 1})`;
      const angle = lerp(...spot.angle, progress);
      const size = lerp(...spot.size, progress);
      const offset: Vec2 = angleMovement(angle, (radius * 1.5 - size) * spot.offset);

      ctx.beginPath();
      ctx.arc(...offset, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderDoomsday(ctx: CanvasRenderingContext2D): void {
    const progress = this.getDoomsdayProgress();
    if (progress === null) return;

    const { pos, size } = this;
    const radius = (size[0] / 2) * progress;
    const colorPulse = (Math.sin((Date.now() / 1000) * Math.PI) + 1) / 4 + 0.25;

    ctx.save();

    ctx.translate(pos[0], pos[1]);

    ctx.fillStyle = `rgba(255,0,0,${colorPulse})`;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public moveWithPlanet(gameObj: GameObject, dt: number): void {
    const { pos, size, rotSpeed } = this;
    const radius = size[0] / 2 + gameObj.getSize()[1] / 2;

    const angleToObj = this.getAngleTo(gameObj);
    const newAngle = angleToObj + rotSpeed * dt;

    const rads1 = toRads(angleToObj);
    const rads2 = toRads(newAngle);
    gameObj.movePos([(Math.sin(rads2) - Math.sin(rads1)) * radius, -(Math.cos(rads2) - Math.cos(rads1)) * radius]);
    gameObj.setRot(newAngle);
  }

  public getObjects<T extends PlanetObject = PlanetObject>(typeT?: new (...params: unknown[]) => T): T[] {
    if (!typeT) return this.objects as T[];
    return this.objects.filter((object) => object instanceof typeT) as T[];
  }

  public willGetDestroyed(): boolean {
    return this._doomsdayEnd !== null;
  }

  public getRotSpeed(): number {
    return this.rotSpeed;
  }

  public setPlayerOnPlanet(player: Player | null): void {
    const wasPlayerOnPlanet = this._playerOnPlanet !== null;
    this._playerOnPlanet = player?.getRot() ?? null;

    if (player && !wasPlayerOnPlanet) {
      const humans = this.getObjects(Human);
      humans.forEach((human) => {
        const dist = human.getDistanceTo(player);
        if (dist > 16) return;
        human.kill();
      });
    }
  }

  public getPlayerOnPlanet(): number | null {
    return this._playerOnPlanet;
  }

  public setHumanReadyForPickup(human: Human): void {
    if (human.toBeDeleted()) return;

    human.delete();
    this.world.game.score.rescuedPeople++;
  }

  public getDoomsdayProgress(): number {
    if (this._doomsdayEnd === null) return 0;
    return Math.min(1, 1 - (this._doomsdayEnd - Date.now()) / DoomsdayInMillis);
  }

  public getEmergingProgress(): number | null {
    if (this._emergingEnd === null) return 1;
    return Math.min(1, 1 - (this._emergingEnd - Date.now()) / PlanetEmergingInMillis);
  }

  public isEmerging(): boolean {
    return this._isEmerging;
  }

  public startDoomsday(): Promise<void> {
    this._doomsdayEnd = Date.now() + DoomsdayInMillis;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, DoomsdayInMillis);
    });
  }

  public destroyPlanet(): void {
    this.delete();

    const player = this.world.player;
    if (player) {
      const dist = this.getDistanceTo(player);
      const treshold = this.getSize()[0] / 20;
      if (dist < treshold) {
        player.die();
      }
    }

    const multiplier = this.world.game.settings.graphicsMultiplier;
    for (let i = 0; i < 100 * multiplier; i++) {
      const size = Math.random() * 10 + 5;

      this.world.add(new ExplosionParticle(this.world, this.pos, [size, size], this.size[0] / 2, 10 + Math.random() * 100));
    }

    this.world.add(new ImplosionParticle(this.world, this.pos, [this.size[0] * 1.1, this.size[1] * 1.1]));
  }

  public startEmerging(): void {
    this._isEmerging = true;
    this._emergingEnd = Date.now() + PlanetEmergingInMillis;

    const radius = this.size[0] / 2;

    for (let i = 0; i < this.colorSpots.length; i++) {
      this.emergingSpots.push({
        angle: [i * (360 / this.colorSpots.length), (Math.random() * 720 - 360) * 5],
        size: [Math.random() * 10 + 5, (radius / 4) * Math.random() + radius / 2],
        color: hexColorToRgb(this.colorSpots[i].color),
        offset: Math.random(),
      });
    }
  }

  private endEmerging(): void {
    this._isEmerging = false;
    this._emergingEnd = null;

    this.createResidents(true);
  }
}
