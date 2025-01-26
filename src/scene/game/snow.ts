import { graphics } from 'alchemy-engine'
import { Graphics } from 'pixi.js'
import { getNextId, state, type EntityId, type SnowMass } from '~/data'
import type { Scene } from '~/type'

const RADIUS = 4 // CONFIG
const START_X = 10
const START_Y = 10
const DIAMETER = RADIUS * 2
const START_SNOW_FROM_MASS: SnowMass = 0
const START_SNOW_TO_MASS: SnowMass = 5
const TYPE = 'snowPatch'

export const letIt = (
  width: number,
  height: number,
  scene: Scene,
) => {
  for (let x = RADIUS + START_X * RADIUS; x < width; x += DIAMETER) {
    for (let y = RADIUS + START_Y * RADIUS; y < height; y += DIAMETER) {
      const id = getNextId()
      state.positions.set(id, { x, y })

      state.radii.set(id, RADIUS)
      state.snowMasses.set(id, START_SNOW_FROM_MASS)
      state.typeToIds[TYPE].push(id)
    }
  }

  const snow = graphics(scene.container)
  snow.zIndex = -99

  fall(START_SNOW_TO_MASS, scene)

  render(snow)
  // Grow snow
  scene.timer.repeatEvery(1000, () => {
    growSnow()
  })

  scene.timer.repeatEvery(4, (_time, _delta) => {
    render(snow)
  })
}

export const fall = async (layerCount: number, scene: Scene) => {
  for (let i = 0; i < layerCount; i++) {
    await scene.timer.delay(20)
    growSnow()
  }
}

const render = (snow: Graphics) => {
  snow.clear()

  const snowPatches = state.typeToIds['snowPatch']

  for (const snowPatch of snowPatches) {
    const { x, y } = state.positions.get(snowPatch)!
    const snowMass = state.snowMasses.get(snowPatch)!

    const alpha = computeAlpha(snowMass)

    snow
      .circle(x - RADIUS, y - RADIUS, DIAMETER)
      .fill({ color: 'white', alpha })
  }
}

export const growSnow = () => {
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
