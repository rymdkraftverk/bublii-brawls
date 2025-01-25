import { sprites, state, type EntityId, type Radius } from '~/data'

// CONFIG
const SPRITE_SCALE_FACTOR = 0.055

export const setRadius = (playerId: EntityId, radius: Radius) => {
  // const radius = Math.sqrt(mass)
  const spriteScale = radius * SPRITE_SCALE_FACTOR
  const mass = radius

  state.masses.set(playerId, mass)
  state.radii.set(playerId, radius)
  const playerSprite = sprites.get(playerId)!
  playerSprite.scale = spriteScale
}
