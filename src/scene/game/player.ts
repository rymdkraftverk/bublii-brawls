import { sprites, state, type EntityId, type Radius } from '~/data'

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
