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
const DENSITY = 1
const MIN_MASS = 500
export const START_MASS = MIN_MASS * 2
const MAX_MASS = 50000

const SNOW_GROWTH_FACTOR = 5

export const increaseMass = (
  entityId: EntityId,
  massIncrease: Mass,
  scene: Scene,
) => {
  const oldMass = scene.state.masses.get(entityId) ?? 0

  // avoid going to zero mass
  const newMass = Math.min(Math.max(oldMass + massIncrease, MIN_MASS), MAX_MASS)
  scene.state.masses.set(entityId, newMass)

  if (scene.state.types.get(entityId) == 'player') {
    const isBublé = state.bublii.get(entityId) ?? false

    if (!isBublé && newMass < START_MASS) {
      bublé(scene, entityId)
      return
    } else if (isBublé && newMass > START_MASS) {
      unBublé(scene, entityId)
    }
  }

  const newRadius = (newMass / DENSITY) ** 0.5 / Math.PI
  const spriteScale = newRadius * getScaleFactor(scene, entityId)
  scene.state.radii.set(entityId, newRadius)

  const playerSprite = sprites.get(entityId)!
  playerSprite.scale = spriteScale
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

  scene.sound['summer-day'].play()

  state.bublii.set(playerId, true)
}

const unBublé = (scene: Scene, playerId: EntityId) => {
  const s = sprites.get(playerId)! as AnimatedSprite
  s.textures = textures.get(playerId)!.map((x) => scene.textures[x])
  s.play()
  state.bublii.set(playerId, false)
}

export const feed = (playerId: EntityId, snowMass: SnowMass, scene: Scene) => {
  increaseMass(playerId, snowMass * SNOW_GROWTH_FACTOR, scene)
}

function getScaleFactor(scene: Scene, entityId: EntityId) {
  switch (scene.state.types.get(entityId)) {
    case 'player':
      return 0.055
    case 'snowBall':
      return 0.07
    default:
      throw 'unexpected entity type without scale factor'
  }
}
