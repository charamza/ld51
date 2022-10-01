import GameObject from "../objects/gameObject";
import Particle from "../objects/particle";
import Planet from "../objects/planet";
import Player from "../objects/player";
import Game from "./game";

export default class World {
  private objects: GameObject[] = [];
  private particles: Particle[] = [];

  constructor(public game: Game) {}

  public create(): Player {
    this.objects = [];
    this.particles = [];

    this.objects.push(
      new Planet(this, {
        pos: [-1000, -1000],
        size: 1350,
      })
    );
    this.objects.push(
      new Planet(this, {
        pos: [800, -100],
        size: 350,
      })
    );
    this.objects.push(
      new Planet(this, {
        pos: [800, 800],
        size: 350,
      })
    );

    const player = new Player(this, {
      pos: [300, 300],
    });

    this.objects.push(player);
    return player;
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
    this.objects.forEach((object) => object.render(ctx));
    this.particles.forEach((particle) => particle.render(ctx));
  }
}
