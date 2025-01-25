export type Vector2d = { x: number; y: number }

export function add(
  { x: x1, y: y1 }: Vector2d,
  { x: x2, y: y2 }: Vector2d,
): Vector2d {
  return { x: x1 + x2, y: y1 + y2 }
}

export function scale(factor: number, { x, y }: Vector2d): Vector2d {
  return { x: factor * x, y: factor * y }
}

export function length({ x, y }: Vector2d): number {
  return (x ** 2 + y ** 2) ** 0.5
}

export function normalize(v: Vector2d): Vector2d {
  const l = length(v)
  if (l == 0) return v

  return scale(1 / l, v)
}

export function dotProduct(
  { x: x1, y: y1 }: Vector2d,
  { x: x2, y: y2 }: Vector2d,
): number {
  return x1 * x2 + y1 * y2
}
