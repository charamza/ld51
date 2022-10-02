import GameObject from "../objects/gameObject";
import Particle from "../objects/particle";
import Planet from "../objects/planet";
import Player from "../objects/player";
import { getDistance } from "../utils/angles";
import { aabb } from "../utils/collisions";
import Game from "./game";

const PlanetsCount = 20;
const PlanetMinRadius = 400;
const PlanetMaxRadius = 1400;
const PlanetsMinGap = 1000;
const MinCenterGap = 1000;

export default class World {
  private objects: GameObject[] = [];
  private particles: Particle[] = [];
  public mapRadius: number = 8000;

  private cycle: number = this.getCycle();

  constructor(public game: Game) {}

  public create(): void {
    this.objects = [];
    this.particles = [];

    const testPlanet = new Planet(this, {
      pos: [0, 700],
      size: 800,
    });
    testPlanet.startEmerging();
    this.objects.push(testPlanet);

    console.log("Using radius", this.mapRadius);

    const planets: Planet[] = [];
    for (let i = 0; i < PlanetsCount; i++) {
      const planet = this.createNewPlanet(planets);
      if (planet) {
        planet.createResidents();
        planets.push(planet);
      }
    }

    this.objects.push(...planets);
  }

  public createPlayer(): Player {
    const player = new Player(this, {
      pos: [0, 0],
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

  public getObjects<T extends GameObject = GameObject>(typeT?: new (...params: unknown[]) => T): T[] {
    if (!typeT) return this.objects as T[];
    return this.objects.filter((object) => object instanceof typeT) as T[];
  }

  public update(dt: number): void {
    const cameraBoundingRect = this.game.camera.getBoundingRect();
    this.objects.forEach((object) => {
      object.update(dt);
      const isVisible = aabb(object.getBoundingBox(), cameraBoundingRect);
      object.setVisible(isVisible);
    });
    this.particles.forEach((particle) => particle.update(dt));

    this.objects = this.objects.filter((object) => !object.toBeDeleted());
    this.particles = this.particles.filter((particle) => !particle.isDead());

    const actualCycle = this.getCycle();
    if (actualCycle !== this.cycle) {
      this.cycle = actualCycle;
      const planets = this.getObjects(Planet);

      if (planets.length > 0) {
        const planet = planets[Math.floor(Math.random() * planets.length)];
        planet.startDoomsday();

        const newPlanet = this.createNewPlanet(planets);
        if (newPlanet) {
          newPlanet.startEmerging();
          this.objects.push(newPlanet);
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const isPlayerInterstellar = this.isPlayerInterstellar();
    if (isPlayerInterstellar) {
      this.game.gui.renderEnteringInterstellarBack(ctx);
    }

    this.renderBorder(ctx);
    this.objects.filter((obj) => obj.isVisible()).forEach((object) => object.render(ctx));
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

  public createNewPlanet(otherPlanets: Planet[]): Planet | null {
    let planet: Planet;

    for (let j = 0; j < 300; j++) {
      const angle = Math.random() * Math.PI * 2;
      const size = Math.random() * (PlanetMaxRadius - PlanetMinRadius) + PlanetMinRadius;
      const distance = Math.random() * (this.mapRadius - MinCenterGap - size) + MinCenterGap;

      planet = new Planet(this, {
        pos: [Math.cos(angle) * distance, Math.sin(angle) * distance],
        size,
      });

      const collidesWith = otherPlanets.find((otherPlanet) => otherPlanet.getDistanceTo(planet) < PlanetsMinGap);
      if (!collidesWith) break;

      planet = null;
    }

    if (!planet) console.log("Couldn't place planet");
    return planet;
  }

  private getCycle(): number {
    const cycleEachMs = 14 * 1000;
    return Math.floor(Date.now() / cycleEachMs);
  }
}
