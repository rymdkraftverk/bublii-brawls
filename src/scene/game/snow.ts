import { graphics } from 'alchemy-engine'
import type { Container } from 'pixi.js'
import { getNextId, state } from '~/data'

const RADIUS = 5
const DIAMETER = RADIUS * 2
const TYPE = 'snowPatch'

export const letItSnow = (
  container: Container,
  width: number,
  height: number,
) => {
  for (let x = RADIUS; x < width; x += DIAMETER) {
    for (let y = RADIUS; y < height; y += DIAMETER) {
      const id = getNextId()
      state.positions[id] = { x, y }
      state.radii[id] = RADIUS
      state.types[id] = TYPE
      state.typeToIds[TYPE].push(id)

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
