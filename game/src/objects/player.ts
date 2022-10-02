import World from "../game/world";
import ExplosionParticle from "../particles/explosionParticle";
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
      // Still not collidable
      if (planet.isEmerging()) return closest;
      // Closest is null, so pick first planet
      if (!closest) return planet;
      // Check if planet is closer than closest
      if (planet.getDistanceTo(this) < closest.getDistanceTo(this)) {
        return planet;
      }
      return closest;
    }, null);

    const frontAccel = 0.1;
    const backAccel = 0.05;
    const turnAccel = 5;
    const turnSpeedDecel = 1.02;
    const planetSafeLandingMaxAngle = 40;
    const normalized = dt / 0.016;

    const inputForward = Input.isKeyDown("w") || Input.isKeyDown("ArrowUp");
    const inputBack = Input.isKeyDown("s") || Input.isKeyDown("ArrowDown") || Input.isKeyDown(" ");
    const inputLeft = Input.isKeyDown("a") || Input.isKeyDown("ArrowLeft");
    const inputRight = Input.isKeyDown("d") || Input.isKeyDown("ArrowRight");

    if (inputLeft) {
      this.rot -= turnAccel * normalized;
      this.a /= turnSpeedDecel;
      this.emitRightParticles();
    }
    if (inputRight) {
      this.rot += turnAccel * normalized;
      this.a /= turnSpeedDecel;
      this.emitLeftParticles();
    }
    if (inputBack) {
      if (this.a > 0) {
        this.a = this.a / (1.01 * normalized) - backAccel * normalized;
      } else {
        this.a = this.a - backAccel * normalized;
      }
      this.emitFrontParticles();
    } else if (inputForward) {
      this.a += frontAccel * normalized;
      this.emitBackParticles();
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
      const planetInfluence = 1 - clamp(planetDistance / 500, 0.02, 1); // 0.0 - 0.98
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
        if (!(inputForward && Math.abs(angleDiff) < planetSafeLandingMaxAngle)) this.a = 0;

        if (Math.abs(angleDiff) < planetSafeLandingMaxAngle) {
          closestPlanet.moveWithPlanet(this, dt);
          // console.log("moved with planet");
          this.pos = addVec2(this.pos, angleMovement(this.rot, -(dist + 0.001)));
          closestPlanet.setPlayerOnPlanet(this);
        } else {
          this.die();
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

  public die(): void {
    this.delete();
    this.world.game.gameOver();

    for (let i = 0; i < 1000; i++) {
      const size = Math.random() * 10 + 5;

      this.world.add(new ExplosionParticle(this.world, this.pos, [size, size]));
    }
  }

  public getAcceleration(): number {
    return this.a;
  }

  public setAcceleration(value: number): void {
    this.a = value;
  }
}
