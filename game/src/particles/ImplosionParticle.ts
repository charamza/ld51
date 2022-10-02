import World from "../game/world";
import Particle from "../objects/particle";
import { Vec2 } from "../utils/vectors";

export default class ImplosionParticle extends Particle {
  constructor(world: World, pos: Vec2, size: Vec2) {
    super(world, {
      pos,
      size,
      color: "#fff",
      rot: 0,
      a: 0,
      decayIn: 3,
      opacity: 1,
      scale: 1,
    });
  }
}
