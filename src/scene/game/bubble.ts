import { getDistance } from 'tiny-toolkit'
import { normalize, scale, subtract } from '~/util/vector2d'
import { sprites, state, type EntityId } from '~/data'
import type { Scene } from '~/type'
import { backToSnow, setMass, START_MASS } from './player'
import { fall } from './snow'
import type { AnimatedSprite } from 'pixi.js'

const MAXIMUM_SPEED = 3

const exchangeMassForSnowMass = (mass: number) => {
  return Math.floor(mass / 10000) + 1
}

const itGoesPop = (scene: Scene, playerId: EntityId) => {
  const snowmass = exchangeMassForSnowMass(state.masses.get(playerId)!)

  const s = sprites.get(playerId)! as AnimatedSprite
  s.textures = [
    scene.textures['popping_player_0-1'],
    scene.textures['popping_player_0-2'],
    scene.textures['popping_player_0-3'],
    scene.textures['popping_player_0-4'],
    scene.textures['popping_player_0-5'],
  ]
  s.onFrameChange = () => {
    s.scale = s.scale.x + 1
  }
  s.play()
  s.loop = false
  s.onComplete = async () => {
    s.onFrameChange = () => {}
    s.visible = false
    await fall(snowmass, scene)
    setMass(playerId, START_MASS, scene)
    backToSnow(scene, playerId)
    state.conditions.set(playerId, 'normal')
    s.visible = true
  }
}

export const pop = (scene: Scene, entityId: EntityId) => {
  const condition = state.conditions.get(entityId)
  if (!condition || condition !== 'normal') {
    return
  }

  const mass = state.masses.get(entityId)!
  if (mass < 4500) {
    return
  }

  const entityPosition = scene.state.positions.get(entityId)!
  const targetPosition = {
    x: scene.app.screen.width / 2,
    y: scene.app.screen.height / 2,
  }

  state.conditions.set(entityId, 'popping-the-bubble')
  const direction = normalize(subtract(entityPosition, targetPosition))

  const velocity = scale(MAXIMUM_SPEED, direction)
  scene.state.velocities.set(entityId, velocity)

  const unsubscribe = scene.timer.repeatEvery(1, () => {
    const currentPosition = state.positions.get(entityId)!
    const targetDistance = getDistance(currentPosition, targetPosition)

    if (Math.abs(targetDistance) < 2) {
      scene.state.velocities.set(entityId, { x: 0, y: 0 })
      unsubscribe()
      itGoesPop(scene, entityId)
      return
    }
  })
}
