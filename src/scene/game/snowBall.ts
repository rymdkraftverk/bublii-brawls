import { sprite } from 'alchemy-engine'
import { getNextId, sprites, state, type EntityId } from '~/data'
import type { Scene } from '~/type'

// CONFIG
const SPEED = 3
const PLAYER_MASS_REQUIREMENT = 5

const SNOWBALL_FACTOR = 0.1
const PLAYER_SHRINK_FACTOR = 1 - SNOWBALL_FACTOR

export const launch = (scene: Scene, from: EntityId, angleRadian: number) => {
  const playerMass = state.masses.get(from)!
  if (playerMass < PLAYER_MASS_REQUIREMENT) return

  // create snowball
  const id = getNextId()

  const velocity = {
    x: SPEED * Math.cos(angleRadian),
    y: SPEED * Math.sin(angleRadian),
  }

  const snowBallMass = playerMass * SNOWBALL_FACTOR
  const fromPosition = state.positions.get(from)!
  state.positions.set(id, fromPosition)
  state.velocities.set(id, velocity)
  state.radii.set(id, snowBallMass)

  const s = sprite(scene.container)
  s.texture = scene.textures['snowball_0-1']
  s.position.set(fromPosition.x, fromPosition.y)
  s.scale.set(snowBallMass)
  s.anchor = 0.5
  sprites.set(id, s)

  // shrink player
  const shrunkPlayerMass = playerMass * PLAYER_SHRINK_FACTOR
  state.masses.set(from, shrunkPlayerMass)
  state.radii.set(from, shrunkPlayerMass)
  const playerSprite = sprites.get(from)!
  const playerScale = playerSprite.scale.x
  playerSprite.scale = playerScale * PLAYER_SHRINK_FACTOR
}
