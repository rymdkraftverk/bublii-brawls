import { sprite } from 'alchemy-engine'
import { toDegrees } from 'tiny-toolkit'
import { getNextId, sprites, state, type EntityId, type Radian } from '~/data'
import type { Scene } from '~/type'
import { setRadius } from './player'

// CONFIG
const SPEED = 3
const PLAYER_RADIUS_REQUIREMENT = 10

const SNOWBALL_AREA_FACTOR = 0.3

const SPRITE_SCALE_FACTOR = 0.07

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

  const { shrunkPlayerRadius: radiusPlayer, snowBallRadius: radiusSnowBall } =
    birthSnowBall(playerRadius, SNOWBALL_AREA_FACTOR)

  const fromPosition = state.positions.get(from)!
  state.positions.set(id, fromPosition)
  state.velocities.set(id, velocity)
  state.radii.set(id, radiusSnowBall)
  state.typeToIds[TYPE].push(id)
  state.snowBallLaunchers.set(id, from)

  const s = sprite(scene.container)
  s.texture = scene.textures['snowball_0-1']
  s.position.set(fromPosition.x, fromPosition.y)
  const spriteScale = radiusSnowBall * SPRITE_SCALE_FACTOR
  s.scale.set(spriteScale)
  s.angle = toDegrees(angle)
  s.anchor = 0.5
  sprites.set(id, s)

  // shrink player
  setRadius(from, radiusPlayer)
}

const birthSnowBall = (
  playerRadius: number,
  snowBallFactor: number,
) => {
  const totalArea = Math.PI * playerRadius * playerRadius

  const areaSnowBall = totalArea * snowBallFactor
  const areaPlayer = totalArea * (1 - snowBallFactor)

  const radiusPlayer = Math.sqrt(areaPlayer / Math.PI)
  const radiusSnowBall = Math.sqrt(areaSnowBall / Math.PI)

  return {
    shrunkPlayerRadius: radiusPlayer,
    snowBallRadius: radiusSnowBall,
  }
}

export const absorbSnowball = (
  playerRadius: number,
  snowBallRadius: number,
) => {
  const areaPlayer = Math.PI * Math.pow(playerRadius, 2);
  const areaSnowball = Math.PI * Math.pow(snowBallRadius, 2);
  const combinedArea = areaPlayer + areaSnowball;

  const grownPlayerRadius = Math.sqrt(combinedArea / Math.PI);
  return grownPlayerRadius
}
