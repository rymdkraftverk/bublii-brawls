import { sprite } from 'alchemy-engine'
import { toDegrees } from 'tiny-toolkit'
import { getNextId, sprites, state, type EntityId, type Radian } from '~/data'
import type { Scene } from '~/type'
import { setRadius } from './player'

// CONFIG
const SPEED = 3
const PLAYER_RADIUS_REQUIREMENT = 10

const SNOWBALL_FACTOR = 0.5
const PLAYER_SHRINK_FACTOR = 1 - SNOWBALL_FACTOR

const TYPE = 'snowBall'

export const launch = (scene: Scene, from: EntityId, angle: Radian) => {
  const playerRadius = state.radii.get(from)!
  if (playerRadius < PLAYER_RADIUS_REQUIREMENT) return

  // create snowball
  const id = getNextId()

  const velocity = {
    x: SPEED * Math.cos(angle),
    y: SPEED * Math.sin(angle),
  }

  const snowBallRadius = playerRadius * SNOWBALL_FACTOR
  const fromPosition = state.positions.get(from)!
  state.positions.set(id, fromPosition)
  state.velocities.set(id, velocity)
  state.radii.set(id, snowBallRadius)
  state.typeToIds[TYPE].push(id)

  const s = sprite(scene.container)
  s.texture = scene.textures['snowball_0-1']
  s.position.set(fromPosition.x, fromPosition.y)
  s.scale.set(snowBallRadius)
  s.angle = toDegrees(angle)
  s.anchor = 0.5
  sprites.set(id, s)

  // shrink player

  const shrunkPlayerRadius = playerRadius * PLAYER_SHRINK_FACTOR
  console.log({ playerRadius, shrunkPlayerRadius })
  setRadius(from, shrunkPlayerRadius)
}
