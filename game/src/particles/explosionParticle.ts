import World from "../game/world";
import Particle from "../objects/particle";
import { toRads } from "../utils/angles";
import { addVec2, Vec2 } from "../utils/vectors";

export default class ExplosionParticle extends Particle {
  constructor(world: World, pos: Vec2, size: Vec2, distance: number = 0, speed: number | null = null) {
    const r = Math.floor(Math.random() * 4);
    let color = "#ff5733";
    if (r === 1) color = "#C70039";
    if (r === 2) color = "#900C3F";
    if (r === 3) color = "#581845";

    const rot = Math.random() * 360;
    const rads = toRads(rot);

    const offsetedPos = addVec2(pos, [Math.sin(rads) * distance, -Math.cos(rads) * distance]);

    super(world, {
      pos: offsetedPos,
      size,
      rot,
      a: speed ?? 80 / (15.5 - size[0]),
      scale: 1,
      opacity: 1,
      decayIn: 1 + Math.random() * 4,
      color,
    });
  }
}
