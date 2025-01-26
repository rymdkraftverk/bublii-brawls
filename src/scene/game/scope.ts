import { graphics } from 'alchemy-engine'
import type { Graphics } from 'pixi.js'
import { state, type EntityId } from '~/data'
import type { Scene } from '~/type'

export const init = (playerId: EntityId, scene: Scene) => {
  const g = graphics(scene.container)
  g.zIndex = 100

  scene.timer.repeatEvery(1, (_time, _delta) => {
    render(g, playerId)
  })
}

const render = (g: Graphics, playerId: EntityId) => {
  const playerPosition = state.positions.get(playerId)
  const condition = state.conditions.get(playerId)
  const isBuble = state.bublii.get(playerId) ?? false

  g.clear()

  if (playerPosition === undefined || condition == undefined) return

  // console.log({ playerPosition, condition, isBuble })

  const noScope = condition === 'popping-the-bubble' || isBuble

  if (noScope) return
  const aim = state.aims.get(playerId)

  if (!aim) return

  const { x, y } = getCoordinates(playerPosition.x, playerPosition.y, 50, aim)

  g.circle(x, y, 3).fill({ color: '#fc03c6', alpha: 1 })
}

const getCoordinates = (
  x: number,
  y: number,
  distance: number,
  angle: number,
) => {
  const xB = x + distance * Math.cos(angle)
  const yB = y + distance * Math.sin(angle)
  return { x: xB, y: yB }
}
