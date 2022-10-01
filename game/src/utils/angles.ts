import { Vec2 } from "./vectors";

export function toRads(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function toDegrees(rads: number): number {
  return (rads * 180) / Math.PI;
}

export function getAnglesDiff(a: number, b: number): number {
  return ((((a - b + 180) % 360) + 360) % 360) - 180;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function angleMovement(angle: number, a: number): Vec2 {
  const rads = toRads(angle);
  return [Math.sin(rads) * a, -Math.cos(rads) * a];
}

export function getDistance(a: Vec2, b: Vec2): number {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}
