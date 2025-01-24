import { graphics } from 'alchemy-engine'
import { Container, Graphics } from 'pixi.js'
import { getNextId, state, type SnowMass } from '~/data'

const RADIUS = 5
const DIAMETER = RADIUS * 2
const TYPE = 'snowPatch'

export const letIt = (
  width: number,
  height: number,
  container: Container,
  repeatEvery: (
    interval: number,
    callback: (time: number, deltaTime: number) => void,
  ) => () => void,
) => {
  init(width, height)
  startRender(container, repeatEvery)
}

const init = (width: number, height: number) => {
  for (let x = RADIUS; x < width; x += DIAMETER) {
    for (let y = RADIUS; y < height; y += DIAMETER) {
      const id = getNextId()
      state.positions.set(id, { x, y })

      state.radii[id] = RADIUS
      state.snowMasses[id] = 0
      state.types[id] = TYPE
      state.typeToIds[TYPE].push(id)
    }
  }
}

export const startRender = (
  container: Container,
  repeatEvery: (
    interval: number,
    callback: (time: number, deltaTime: number) => void,
  ) => () => void,
) => {
  const snow = graphics(container)
  snow.zIndex = -99

  render(snow)
  repeatEvery(100, (_time, _delta) => {
    render(snow)
  })
}

const render = (snow: Graphics) => {
  snow.clear()

  const snowPatches = state.typeToIds['snowPatch']

  for (const snowPatch of snowPatches) {
    const { x, y } = state.positions.get(snowPatch)!
    const snowMass = state.snowMasses[snowPatch]!

    const nextSnowMass = getNextSnowMass(snowMass)
    state.snowMasses[snowPatch] = nextSnowMass

    const alpha = computeAlpha(snowMass)

    snow
      .rect(x - RADIUS, y - RADIUS, DIAMETER - 1, DIAMETER - 1)
      // .rect(x - RADIUS, y - RADIUS, DIAMETER, DIAMETER)
      .fill({ color: 'white', alpha })

    console.log({ x, y, snowPatch, alpha })
  }
}

const computeAlpha = (snowMass: SnowMass) => snowMass * 0.2

const getNextSnowMass = (snowMass: SnowMass): SnowMass => {
  if (snowMass === 0) return 1
  if (snowMass === 1) return 2
  if (snowMass === 2) return 3
  if (snowMass === 3) return 4
  if (snowMass === 4) return 5
  return 5
}
