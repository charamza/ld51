import World from "../game/world";
import { angleMovement, clamp, getAnglesDiff, toRads } from "../utils/angles";
import Input from "../utils/input";
import { addVec2, subVec2, Vec2 } from "../utils/vectors";
import GameObject from "./gameObject";
import Particle from "./particle";
import Planet from "./planet";

export default class Player extends GameObject {
  protected color: string = "#ffffff";
  protected a: number = 0;

  constructor(world: World, props: { pos: Vec2; color?: string }) {
    super(world, { ...props, size: [40, 48] });

    if (props.color) this.color = props.color;
  }

  public update(dt: number): void {
    const planets = this.world.getObjects(Planet);
    const closestPlanet = planets.reduce<Planet | null>((closest, planet) => {
      if (!closest) return planet;
      if (planet.getDistanceTo(this) < closest.getDistanceTo(this)) {
        return planet;
      }
      return closest;
    }, null);

    const frontAccel = 0.05;
    const backAccel = 0.025;
    const turnAccel = 5;
    const turnSpeedDecel = 1.02;
    const planetSafeLandingMaxAngle = 40;
    const normalized = dt / 0.016;

    if (Input.isKeyDown("ArrowLeft")) {
      this.rot -= turnAccel * normalized;
      this.a /= turnSpeedDecel;
      this.emitRightParticles();
    }
    if (Input.isKeyDown("ArrowRight")) {
      this.rot += turnAccel * normalized;
      this.a /= turnSpeedDecel;
      this.emitLeftParticles();
    }
    if (Input.isKeyDown("ArrowUp")) {
      this.a += frontAccel * normalized;
      this.emitBackParticles();
    } else if (Input.isKeyDown("ArrowDown")) {
      if (this.a > 0) {
        this.a = this.a / (1.01 * normalized) - backAccel * normalized;
      } else {
        this.a = this.a - backAccel * normalized;
      }
      this.emitFrontParticles();
    } else {
      if (this.a > 10) {
        this.a = this.a / (1.004 * normalized);
      }
    }

    let isColliding = false;

    let dpos = angleMovement(this.rot, this.a);

    if (closestPlanet) {
      const planetAngle = this.getAngleTo(closestPlanet);
      const planetDistance = closestPlanet.getDistanceTo(this);
      const planetInfluence = 1 - clamp(planetDistance / 500, 0.2, 1); // 0.0 - 0.8
      const planetWeight = 6; //closestPlanet.getSize()[0] / 60;

      const planetAngleDiff = getAnglesDiff(this.rot, planetAngle);

      const planetAcceleration = planetInfluence * frontAccel * Math.cos(toRads(planetAngleDiff));
      this.a += planetAcceleration;
      if (Math.abs(planetAngleDiff) < 180 - planetSafeLandingMaxAngle) {
        this.rot =
          planetAngleDiff > 0 ? this.rot - (planetInfluence * 5) / planetWeight : this.rot + (planetInfluence * 5) / planetWeight;
      }
    }

    this.pos = addVec2(this.pos, dpos);

    if (closestPlanet) {
      const dist = closestPlanet.getDistanceTo(this);
      const planetAngle = closestPlanet.getAngleTo(this);
      const angleDiff = getAnglesDiff(planetAngle, this.rot);

      if (dist <= 0) {
        if (!(Input.isKeyDown("ArrowUp") && Math.abs(angleDiff) < planetSafeLandingMaxAngle)) this.a = 0;

        if (Math.abs(angleDiff) < planetSafeLandingMaxAngle) {
          closestPlanet.moveWithPlanet(this, dt);
          this.pos = addVec2(this.pos, angleMovement(this.rot, -(dist + 0.001)));
          closestPlanet.setPlayerOnPlanet(this);
        } else {
          this.emitCrashParticles();
          this.delete();
          this.world.game.gameOver();
        }
      } else {
        closestPlanet.setPlayerOnPlanet(null);
      }
    }

    if (isColliding) {
      this.pos = subVec2(this.pos, dpos);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const { pos, size, color } = this;

    ctx.save();
    ctx.translate(pos[0], pos[1]);
    ctx.rotate((this.rot * Math.PI) / 180);

    ctx.fillStyle = color;
    //ctx.strokeRect(pos[0] - size[0] / 2, pos[1] - size[1] / 2, size[0], size[1]);
    ctx.beginPath();
    ctx.moveTo(0, 0 - size[1] / 2);
    ctx.lineTo(0 + size[0] / 2, 0 + size[1] / 2);
    ctx.lineTo(0, 0 + size[1] / 4);
    ctx.lineTo(0 - size[0] / 2, 0 + size[1] / 2);
    ctx.lineTo(0, 0 - size[1] / 2);
    ctx.fill();

    ctx.restore();
  }

  private emitThrustParticle(rot: number, a: number = 0, additionalDistance?: number): void {
    const rads = (rot / 180) * Math.PI;
    const distance = 10 + (additionalDistance ?? 0);
    if (a < 100) a = 100;
    if (a > 800) a = 800;
    this.world.add(
      new Particle(this.world, {
        pos: [this.pos[0] + Math.sin(rads) * distance, this.pos[1] - Math.cos(rads) * distance],
        size: [2, 2],
        rot: rot + Math.random() * 45 - 22.5,
        a,
        scale: 1,
        opacity: 1,
        decayIn: 1,
        color: this.color,
      })
    );
  }

  private emitBackParticles(): void {
    for (let i = 0; i < 5; i++) {
      this.emitThrustParticle(this.rot - 180, 0, Math.random() * 5 * this.a);
    }
  }

  private emitFrontParticles(): void {
    this.emitLeftParticles();
    this.emitRightParticles();
  }

  private emitLeftParticles(): void {
    for (let i = 0; i < 2; i++) {
      this.emitThrustParticle(this.rot - 30, this.a * 75);
    }
  }

  private emitRightParticles(): void {
    for (let i = 0; i < 2; i++) {
      this.emitThrustParticle(this.rot + 30, this.a * 75);
    }
  }

  private emitCrashParticles(): void {
    for (let i = 0; i < 1000; i++) {
      const r = Math.floor(Math.random() * 4);
      let color = "#ff5733";
      if (r === 1) color = "#C70039";
      if (r === 2) color = "#900C3F";
      if (r === 3) color = "#581845";

      const size = Math.random() * 10 + 5;
      this.world.add(
        new Particle(this.world, {
          pos: [this.pos[0], this.pos[1]],
          size: [size, size],
          rot: Math.random() * 360,
          a: 80 / (15.5 - size),
          scale: 1,
          opacity: 1,
          decayIn: 3,
          color,
        })
      );
    }
  }

  public getAcceleration(): number {
    return this.a;
  }
}
