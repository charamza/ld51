import { getAnglesDiff } from "../utils/angles";
import Particle from "./particle";
import Planet from "./planet";
import PlanetObject from "./planetObject";

const headColors = ["#fbc5a1", "#e37e62", "#fddcab", "#c18c60", "#fec484"];

export default class Human extends PlanetObject {
  private dx: number = 0;
  private bodyColor: string = "#fff";
  private headColor: string = "#fff";
  private handsOffset: number = 0;

  constructor(planet: Planet) {
    super(planet, { size: [4, 12] });

    this.rot = Math.random() * 360;

    const planetScaleModifier = 400 / this.planet.getSize()[0];
    this.dx = (Math.random() * 1 + 1.1) * (Math.random() < 0.5 ? -1 : 1) * planetScaleModifier;
    this.bodyColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    this.headColor = headColors[Math.floor(Math.random() * headColors.length)];
    this.handsOffset = Math.random() * 1000;
  }

  public update(dt: number): void {
    const playerOnPlanet = this.planet.getPlayerOnPlanet();
    const runningSpeed = Math.abs(this.dx) * 15;
    if (playerOnPlanet && this.planet.willGetDestroyed()) {
      const diff = getAnglesDiff(this.rot, playerOnPlanet);
      if (diff > 0) {
        this.rot -= runningSpeed * dt;
        const newDiff = getAnglesDiff(this.rot, playerOnPlanet);
        if (newDiff < 0) {
          this.rot = playerOnPlanet;
          this.planet.setHumanReadyForPickup(this);
        }
      } else {
        this.rot += runningSpeed * dt;
        const newDiff = getAnglesDiff(this.rot, playerOnPlanet);
        if (newDiff > 0) {
          this.rot = playerOnPlanet;
          this.planet.setHumanReadyForPickup(this);
        }
      }
    } else {
      this.rot += this.dx * dt;
    }

    super.update(dt);
  }

  protected renderSprite(ctx: CanvasRenderingContext2D): void {
    const headSize = 4;

    // Body
    ctx.fillStyle = this.bodyColor;
    ctx.fillRect(0, 0, this.size[0], this.size[1] - headSize);

    // Head
    ctx.fillStyle = this.headColor;
    ctx.fillRect(0, this.size[1] - headSize, this.size[0], headSize);

    // Hands waving
    ctx.fillStyle = this.bodyColor;

    const handsUp = this.planet.willGetDestroyed();
    [-1, 1].forEach((dir) => {
      const handsRot = Math.abs(Math.sin((Date.now() + this.handsOffset) / 1000)) * (60 + 15 * (handsUp ? 0 : 1)) + 15;
      const handRotRads = (handsRot + 90 * (handsUp ? 0 : 1)) * dir * (Math.PI / 180);
      const handSize = [1 + (handsUp ? 1 : 0), 4 + (handsUp ? 2 : 0)];

      ctx.save();
      ctx.translate(this.size[0] / 2, this.size[1] - headSize);
      ctx.rotate(handRotRads);
      ctx.fillRect(-handSize[0] / 2, this.size[0] / 2, handSize[0], handSize[1]);
      ctx.restore();
    });
  }

  public kill(): void {
    this.delete();
    this.world.game.score.killedPeople++;

    for (let i = 0; i < 20; i++) {
      this.world.add(
        new Particle(this.world, {
          pos: [this.pos[0], this.pos[1]],
          size: [2, 2],
          rot: this.rot + Math.random() * 135 - 62.5,
          a: 8 + Math.random() * 24,
          scale: 1,
          opacity: 1,
          decayIn: 2 + Math.random() * 2,
          color: "red",
        })
      );
    }
  }
}
