import Planet from "./planet";
import PlanetObject from "./planetObject";

export default class House extends PlanetObject {
  constructor(planet: Planet) {
    super(planet, { size: [24, 24] });

    this.rot = Math.random() * 360;
  }

  protected renderSprite(ctx: CanvasRenderingContext2D): void {
    const doorSize = [4, 8];

    // Body
    ctx.fillStyle = "#d0a67c";
    ctx.fillRect(0, 0, this.size[0], this.size[1] / 2);

    // Roof
    ctx.fillStyle = "#55524d";
    ctx.beginPath();
    ctx.moveTo(0, this.size[1] / 2);
    ctx.lineTo(this.size[0] / 2, this.size[1]);
    ctx.lineTo(this.size[0], this.size[1] / 2);
    ctx.fill();

    // Door
    ctx.fillStyle = "#a67c5e";
    ctx.fillRect((this.size[0] - doorSize[0]) / 2, 0, doorSize[0], doorSize[1]);
  }
}
