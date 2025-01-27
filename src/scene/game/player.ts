import { animatedSprite } from 'alchemy-engine'
import type { AnimatedSprite } from 'pixi.js'
import { grid } from 'tiny-toolkit'
import {
  sprites,
  state,
  type EntityId,
  type Mass,
  textures,
  type SnowMass,
} from '~/data'
import { type Scene } from '~/type'
import * as scope from './scope'

// CONFIG
const DENSITY = 1
export const MIN_MASS = 500
export const START_MASS = MIN_MASS * 2
export const MAX_MASS = 50000

const SNOW_GROWTH_FACTOR = 5

export const setMass = (entityId: EntityId, mass: Mass, scene: Scene) => {
  const newMass = Math.min(Math.max(mass, MIN_MASS), MAX_MASS)
  scene.state.masses.set(entityId, newMass)

  /*
  if (scene.state.types.get(entityId) == 'player') {
    const isBublé = state.bublii.get(entityId) ?? false
    if (!isBublé && newMass < START_MASS) {
      bublé(scene, entityId)
      return
    } else if (isBublé && newMass > START_MASS) {
      unBublé(scene, entityId)
    }
  }
    */

  const newRadius = (newMass / DENSITY) ** 0.5 / Math.PI
  const spriteScale = newRadius * getScaleFactor(scene, entityId)
  scene.state.radii.set(entityId, newRadius)

  const playerSprite = sprites.get(entityId)!
  playerSprite.scale = spriteScale
}

export const increaseMass = (
  entityId: EntityId,
  massIncrease: Mass,
  scene: Scene,
) => {
  const oldMass = scene.state.masses.get(entityId) ?? 0
  const newMass = oldMass + massIncrease

  setMass(entityId, newMass, scene)
}

export const heal = (
  playerId: EntityId,
  snowballId: EntityId,
  scene: Scene,
) => {
  const snowBallMass = state.masses.get(snowballId)!
  increaseMass(playerId, snowBallMass, scene)

  const newMass = scene.state.masses.get(playerId)!
  const isBublé = state.bublii.get(playerId) ?? false

  if (isBublé && newMass > START_MASS) {
    unBublé(scene, playerId)
  }
}

export const bublé = (scene: Scene, playerId: EntityId) => {
  const s = sprites.get(playerId)! as AnimatedSprite
  s.loop = true
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

  scene.sound['SFX_collect&bonus3'].play()
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

const getStartPosition = grid({
  x: 70,
  y: 70,
  marginX: 500,
  marginY: 350,
  breakAt: 2,
})

export function createPlayer(controllerId: EntityId, scene: Scene) {
  const state = scene.state
  const { x, y } = getStartPosition(controllerId)

  const s = animatedSprite(scene.container)

  s.anchor = 0.5
  // const s = spritePool.get()
  s.textures = textures.get(controllerId)!.map((x) => scene.textures[x])
  s.animationSpeed = 0.1
  s.play()
  s.position.set(x, y)

  state.positions.set(controllerId, { x, y })
  state.velocities.set(controllerId, { x: 0, y: 0 })
  state.conditions.set(controllerId, 'normal')
  state.typeToIds.player.push(controllerId)
  state.types.set(controllerId, 'player')
  state.bublii.set(controllerId, false)
  // state.sprites[controllerId] = s
  sprites.set(controllerId, s)

  scope.init(controllerId, scene)

  increaseMass(controllerId, START_MASS, scene)

  // TODO: Facing
  // scene.timer.repeatEvery(2, () => {
  //   const velocity = scene.state.velocities.get(controllerId)!
  //   console.log('scene.timer.repeatEvery ~ velocity:', velocity.x)

  //   if (velocity.x < 0) {
  //     if (s.scale.x > 0) {
  //       scene.state.facings.set(controllerId, 'left')
  //       s.scale.x *= -1
  //     }
  //   }
  //   if (velocity.x > 0) {
  //     if (s.scale.x < 0) {
  //       scene.state.facings.set(controllerId, 'right')
  //       s.scale.x *= -1
  //     }
  //   }
  // })
}
