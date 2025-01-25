import { state } from '~/data'
import type { Scene } from '~/type'
import * as V from '~/util/vector2d'

const frictionCoefficient = 40

export function applyPlayerFriction(scene: Scene) {
  scene.timer.repeatEvery(1, (_time, delta) => {
    for (const playerId of scene.state.typeToIds.player) {
      const oldVelocity = scene.state.velocities.get(playerId)
      const playerMass = scene.state.masses.get(playerId)

      if (!oldVelocity) return
      if (!playerMass) return

      if (state.conditions.get(playerId) == 'popping-the-bubble') {
        return
      }

      const forceAmplitude = (-1 * frictionCoefficient * delta) / playerMass
      const frictionForce = V.scale(forceAmplitude, V.normalize(oldVelocity))

      const newVelocity = V.add(oldVelocity, frictionForce)

      // check if force is greater than oldVelocity we set velocity to 0
      if (V.dotProduct(oldVelocity, newVelocity) < 0) {
        scene.state.velocities.set(playerId, { x: 0, y: 0 })
      } else {
        scene.state.velocities.set(playerId, newVelocity)
      }
    }
  })
}
