import { Vec2 } from "../utils/vectors";
import Planet from "./planet";
import PlanetObject from "./planetObject";

const LeafColors = ["#afbd22", "#6db33f", "#00958f", "#00b193", "#a0d5b5"];

type Leaf = {
  pos: Vec2;
  color: number;
  size: number;
};

export default class Tree extends PlanetObject {
  private leaves: Leaf[] = [];

  constructor(planet: Planet) {
    super(planet, { size: [4, 24] });

    const leafCount = 4;
    for (let i = 0; i < leafCount; i++) {
      this.leaves.push({
        pos: [Math.random() * 8 - 4, Math.random() * 8 + 12],
        color: Math.floor(Math.random() * LeafColors.length),
        size: Math.random() * 4 + 4,
      });
    }

    this.rot = Math.random() * 360;
  }

  protected renderSprite(ctx: CanvasRenderingContext2D): void {
    // Trunk
    ctx.fillStyle = "#d0a67c";
    ctx.fillRect(0, 0, this.size[0], this.size[1] / 2);

    // Leaves
    this.leaves.forEach((leaf) => {
      ctx.fillStyle = LeafColors[leaf.color];
      ctx.beginPath();
      ctx.arc(leaf.pos[0], leaf.pos[1], leaf.size, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
}
