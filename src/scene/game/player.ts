import { sprites, state, type EntityId, type Radius } from '~/data'
import { absorbSnowball } from './snowBall'

// CONFIG
const SPRITE_SCALE_FACTOR = 0.055
const MIN_RADIUS = 5
const MAX_RADIUS = 100

export const setRadius = (playerId: EntityId, radius: Radius) => {
  const clampedRadius = clamp(radius, MIN_RADIUS, MAX_RADIUS)

  const spriteScale = clampedRadius * SPRITE_SCALE_FACTOR
  const mass = clampedRadius

  state.masses.set(playerId, mass)
  state.radii.set(playerId, clampedRadius)
  const playerSprite = sprites.get(playerId)!
  playerSprite.scale = spriteScale
}

export const heal = (playerId: EntityId, snowballId: EntityId) => {
  const playerRadius = state.radii.get(playerId)!
  const snowballRadius = state.radii.get(snowballId)!

  const grownPlayerRadius = absorbSnowball(playerRadius, snowballRadius)
  setRadius(playerId, grownPlayerRadius)
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
