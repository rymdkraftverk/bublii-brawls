import { graphics } from 'alchemy-engine'
import type { Container } from 'pixi.js'

const RADIUS = 5
const DIAMETER = RADIUS * 2

export const letItSnow = (
  container: Container,
  width: number,
  height: number,
) => {
  for (let x = RADIUS; x < width; x += DIAMETER) {
    for (let y = RADIUS; y < height; y += DIAMETER) {
      const snow = graphics(container)
      // TODO: -1 just for visual comform
      snow
        .rect(0, 0, DIAMETER - 1, DIAMETER - 1)
        .fill({ color: 'white', alpha: 1 })
      snow.position.set(x - RADIUS, y - RADIUS)
      snow.zIndex = -99
    }
  }
}
