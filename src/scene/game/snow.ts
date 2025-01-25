import { graphics } from 'alchemy-engine'
import type { TimerInstance } from 'alchemy-engine/dist/src/runtime/internal/timer'
import { Container, Graphics } from 'pixi.js'
import { getNextId, state, type EntityId, type SnowMass } from '~/data'

type RepeatEvery = TimerInstance['repeatEvery']

const RADIUS = 4 // CONFIG
const DIAMETER = RADIUS * 2
const TYPE = 'snowPatch'

export const letIt = (
  width: number,
  height: number,
  container: Container,
  repeatEvery: RepeatEvery,
) => {
  init(width, height)
  startRender(container, repeatEvery)
}

const init = (width: number, height: number) => {
  for (let x = RADIUS; x < width; x += DIAMETER) {
    for (let y = RADIUS; y < height; y += DIAMETER) {
      const id = getNextId()
      state.positions.set(id, { x, y })

      state.radii.set(id, RADIUS)
      state.snowMasses.set(id, 0)
      state.typeToIds[TYPE].push(id)
    }
  }
}

const startRender = (container: Container, repeatEvery: RepeatEvery) => {
  const snow = graphics(container)
  snow.zIndex = -99

  render(snow)
  // Grow snow
  repeatEvery(100, () => {
    growSnow()
  })

  repeatEvery(4, (_time, _delta) => {
    render(snow)
  })
}

const render = (snow: Graphics) => {
  snow.clear()

  const snowPatches = state.typeToIds['snowPatch']

  for (const snowPatch of snowPatches) {
    const { x, y } = state.positions.get(snowPatch)!
    const snowMass = state.snowMasses.get(snowPatch)!

    const alpha = computeAlpha(snowMass)

    snow
      .rect(x - RADIUS, y - RADIUS, DIAMETER, DIAMETER)
      // WARN debug feature
      .stroke({ color: 'black', alpha, width: 1 })
      .fill({ color: 'white', alpha })

    // console.log({ x, y, snowPatch, alpha })
  }
}

const growSnow = () => {
  const snowPatches = state.typeToIds['snowPatch']

  for (const snowPatch of snowPatches) {
    const snowMass = state.snowMasses.get(snowPatch)!
    const nextSnowMass = getNextSnowMass(snowMass)
    state.snowMasses.set(snowPatch, nextSnowMass)
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

export const munch = (snowMassId: EntityId) => {
  const snowMass = state.snowMasses.get(snowMassId)
  state.snowMasses.set(snowMassId, 0)
  return snowMass ?? 0
}
