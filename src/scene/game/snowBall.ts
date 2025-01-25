import { sprite } from 'alchemy-engine'
import { getNextId, sprites, state, type EntityId } from '~/data'
import type { Scene } from '~/type'

const SPEED = 3 // CONFIG

export const launch = (scene: Scene, from: EntityId, angleRadian: number) => {
  const velocity = {
    x: SPEED * Math.cos(angleRadian),
    y: SPEED * Math.sin(angleRadian),
  }

  const id = getNextId()

  const fromPosition = state.positions.get(from)!
  state.positions.set(id, fromPosition)
  state.velocities.set(id, velocity)

  const s = sprite(scene.container)
  s.texture = scene.textures['snowball_0-1']
  s.position.set(fromPosition.x, fromPosition.y)

  sprites.set(id, s)
}
