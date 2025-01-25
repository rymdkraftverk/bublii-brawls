import { sprite } from 'alchemy-engine'
import { toDegrees } from 'tiny-toolkit'
import { getNextId, sprites, state, type EntityId, type Radian } from '~/data'
import type { Scene } from '~/type'
import { increaseMass } from './player'

// CONFIG
const SPEED = 3
const PLAYER_RADIUS_REQUIREMENT = 10

const SNOWBALL_AREA_FACTOR = 0.3

// const SPRITE_SCALE_FACTOR = 0.07

export const COOLDOWN = 20

const TYPE = 'snowBall'

export const launch = (scene: Scene, from: EntityId, angle: Radian) => {
  const playerRadius = state.radii.get(from)!
  if (playerRadius < PLAYER_RADIUS_REQUIREMENT) return

  const playerMass = state.masses.get(from)!

  // create snowball
  const id = getNextId()

  const velocity = {
    x: SPEED * Math.cos(angle),
    y: SPEED * Math.sin(angle),
  }

  /*
  const { shrunkPlayerRadius: radiusPlayer, snowBallRadius: radiusSnowBall } =
    birthSnowBall(playerRadius, SNOWBALL_AREA_FACTOR)
  */

  const fromPosition = state.positions.get(from)!

  const s = sprite(scene.container)
  s.texture = scene.textures['snowball_0-1']
  s.position.set(fromPosition.x, fromPosition.y)
  s.angle = toDegrees(angle)
  s.anchor = 0.5
  sprites.set(id, s)

  // const fromPosition = state.positions.get(from)!
  state.positions.set(id, fromPosition)
  state.velocities.set(id, velocity)
  // state.radii.set(id, radiusSnowBall)
  state.typeToIds[TYPE].push(id)
  state.snowBallLaunchers.set(id, from)

  const snowBallMass = playerMass * SNOWBALL_AREA_FACTOR
  increaseMass(id, snowBallMass, scene)
  increaseMass(from, -1 * snowBallMass, scene)
}
