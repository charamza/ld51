import { Vec4 } from "./vectors";

export function aabb(a: Vec4, b: Vec4): boolean {
  return a[0] < b[2] && a[1] < b[3] && a[2] > b[0] && a[3] > b[1];
}
