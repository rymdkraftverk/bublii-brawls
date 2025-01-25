import type { AnimatedSprite } from 'pixi.js'
import {
  sprites,
  state,
  type EntityId,
  type Mass,
  textures,
  type SnowMass,
} from '~/data'
import { type Scene } from '~/type'

// CONFIG
const SPRITE_SCALE_FACTOR = 0.055
const DENSITY = 1
const MIN_MASS = 500
// const MAX_MASS = 1000
//

const SNOW_GROWTH_FACTOR = 5

export const increaseMass = (
  entityId: EntityId,
  massIncrease: Mass,
  scene: Scene,
) => {
  const oldMass = scene.state.masses.get(entityId) ?? 0

  // avoid going to zero mass
  const newMass = Math.max(oldMass + massIncrease, 1)
  scene.state.masses.set(entityId, newMass)

  const newRadius = (newMass / DENSITY) ** 0.5 / Math.PI
  const spriteScale = newRadius * SPRITE_SCALE_FACTOR
  scene.state.radii.set(entityId, newRadius)

  const playerSprite = sprites.get(entityId)!
  playerSprite.scale = spriteScale

  if (newMass < MIN_MASS) {
    bublé(scene, entityId)
    return
  }

  unBublé(scene, entityId)
}

export const heal = (
  playerId: EntityId,
  snowballId: EntityId,
  scene: Scene,
) => {
  const snowBallMass = state.masses.get(snowballId)!
  increaseMass(playerId, snowBallMass, scene)
}

const bublé = (scene: Scene, playerId: EntityId) => {
  const s = sprites.get(playerId)! as AnimatedSprite
  s.textures = [
    scene.textures['buble_head-1'],
    scene.textures['buble_head_open-1'],
  ]
  s.scale = 0.1
  s.play()

  state.bublii.set(playerId, true)
}

const unBublé = (scene: Scene, playerId: EntityId) => {
  const isBublé = state.bublii.get(playerId) ?? false
  if (isBublé) {
    const s = sprites.get(playerId)! as AnimatedSprite
    s.textures = textures.get(playerId)!.map((x) => scene.textures[x])
    s.play()
    state.bublii.set(playerId, false)
  }
}

export const feed = (playerId: EntityId, snowMass: SnowMass, scene: Scene) => {
  increaseMass(playerId, snowMass * SNOW_GROWTH_FACTOR, scene)
}
