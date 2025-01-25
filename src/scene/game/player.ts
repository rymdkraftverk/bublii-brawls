import { sprites, state, textures, type EntityId, type Radius } from '~/data'
import { absorbSnowball } from './snowBall'
import type { Scene } from '~/type'
import type { AnimatedSprite } from 'pixi.js'

// CONFIG
const SPRITE_SCALE_FACTOR = 0.055
const MIN_RADIUS = 10
const MAX_RADIUS = 100

export const setRadius = (scene: Scene, playerId: EntityId, radius: Radius) => {
  const clampedRadius = clamp(radius, MIN_RADIUS, MAX_RADIUS)

  if (clampedRadius <= MIN_RADIUS) {
    bublé(scene, playerId)
    return
  }

  unBublé(scene, playerId)

  const spriteScale = clampedRadius * SPRITE_SCALE_FACTOR
  const mass = clampedRadius

  state.masses.set(playerId, mass)
  state.radii.set(playerId, clampedRadius)
  const playerSprite = sprites.get(playerId)!
  playerSprite.scale = spriteScale
}

export const heal = (
  scene: Scene,
  playerId: EntityId,
  snowballId: EntityId,
) => {
  const playerRadius = state.radii.get(playerId)!
  const snowballRadius = state.radii.get(snowballId)!

  const grownPlayerRadius = absorbSnowball(playerRadius, snowballRadius)
  setRadius(scene, playerId, grownPlayerRadius)
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

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
