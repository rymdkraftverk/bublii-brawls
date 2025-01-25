import { sprites, state, type EntityId, type Radius } from '~/data'
import { absorbSnowball } from './snowBall'

// CONFIG
const SPRITE_SCALE_FACTOR = 0.055

export const setRadius = (playerId: EntityId, radius: Radius) => {
  const cappedRadius = Math.max(radius, 5)

  const spriteScale = cappedRadius * SPRITE_SCALE_FACTOR
  const mass = cappedRadius

  state.masses.set(playerId, mass)
  state.radii.set(playerId, cappedRadius)
  const playerSprite = sprites.get(playerId)!
  playerSprite.scale = spriteScale
}

export const heal = (playerId: EntityId, snowballId: EntityId) => {
  const playerRadius = state.radii.get(playerId)!
  const snowballRadius = state.radii.get(snowballId)!

  const grownPlayerRadius = absorbSnowball(playerRadius, snowballRadius)
  setRadius(playerId, grownPlayerRadius)
}
