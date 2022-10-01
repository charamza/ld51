import GameObject from "../objects/gameObject";
import Particle from "../objects/particle";
import Planet from "../objects/planet";
import Player from "../objects/player";
import { getDistance } from "../utils/angles";
import { aabb } from "../utils/collisions";
import Game from "./game";

export default class World {
  private objects: GameObject[] = [];
  private particles: Particle[] = [];
  private mapRadius: number = 0;

  constructor(public game: Game) {}

  public create(): Player {
    this.objects = [];
    this.particles = [];

    // this.objects.push(
    //   new Planet(this, {
    //     pos: [-1000, -1000],
    //     size: 1350,
    //   })
    // );
    // this.objects.push(
    //   new Planet(this, {
    //     pos: [800, -100],
    //     size: 350,
    //   })
    // );
    // this.objects.push(
    //   new Planet(this, {
    //     pos: [800, 800],
    //     size: 350,
    //   })
    // );

    const planets: Planet[] = [];
    const planetsCount = 20;
    const emptySpacePercentage = 0.8;
    const planetMinRadius = 200;
    const planetMaxRadius = 1200;

    const sizes = Array(planetsCount)
      .fill(0)
      .map(() => Math.random() * (planetMaxRadius - planetMinRadius) + planetMinRadius);
    const totalPlanetsArea = sizes.map((size) => Math.PI * size * size).reduce((a, b) => a + b, 0);

    const totalSpaceArea = totalPlanetsArea / (1 - emptySpacePercentage);
    const radius = Math.sqrt(totalSpaceArea / Math.PI);
    this.mapRadius = radius + planetMaxRadius;

    console.log("Using radius", radius);

    for (let i = 0; i < planetsCount; i++) {
      let planet: Planet;

      for (let j = 0; j < 100; j++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius + 1000;

        planet = new Planet(this, {
          pos: [Math.cos(angle) * distance, Math.sin(angle) * distance],
          size: sizes[i],
        });

        const collidesWith = planets.find((otherPlanet) => otherPlanet.getDistanceTo(planet) < 100);
        if (!collidesWith) break;

        planet = null;
      }

      if (planet) {
        planets.push(planet);
      } else {
        console.log("Couldn't place planet");
      }
    }

    this.objects.push(...planets);

    const player = new Player(this, {
      pos: [300, 300],
    });

    this.objects.push(player);
    return player;
  }

  public get player(): Player {
    return this.getObjects(Player)[0];
  }

  public add(object: GameObject | Particle): void {
    if (object instanceof GameObject) this.objects.push(object);
    if (object instanceof Particle) this.particles.push(object);
  }

  public getObjects<T extends GameObject>(typeT: new (...params: unknown[]) => T): T[] {
    return this.objects.filter((object) => object instanceof typeT) as T[];
  }

  public update(dt: number): void {
    this.objects.forEach((object) => object.update(dt));
    this.particles.forEach((particle) => particle.update(dt));

    this.objects = this.objects.filter((object) => !object.toBeDeleted());
    this.particles = this.particles.filter((particle) => !particle.isDead());
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const isPlayerInterstellar = this.isPlayerInterstellar();
    if (isPlayerInterstellar) {
      this.game.gui.renderEnteringInterstellarBack(ctx);
    }

    this.renderBorder(ctx);
    const cameraBoundingRect = this.game.camera.getBoundingRect();
    this.objects.filter((obj) => aabb(obj.getBoundingBox(), cameraBoundingRect)).forEach((object) => object.render(ctx));
    this.particles.forEach((particle) => particle.render(ctx));

    if (isPlayerInterstellar) {
      this.game.gui.renderEnteringInterstellarFront(ctx);
    }
  }

  private isPlayerInterstellar(): boolean {
    const playerPos = this.player?.getPos();

    if (!playerPos) return false;

    const playerDistFromCenter = getDistance(playerPos, [0, 0]);
    return playerDistFromCenter > this.mapRadius;
  }

  private renderBorder(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(0, 0, this.mapRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.mapRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
