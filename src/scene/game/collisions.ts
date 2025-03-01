import { getDistance } from 'tiny-toolkit'

import { type EntityId, type Type } from '~/data.js'
import type { Scene } from '~/type.js'

type CollisionConfig = {
  type1: Type
  type2: Type
  onCollision: (id1: EntityId, id2: EntityId) => void
}

export default function collisions(
  scene: Scene,
  collisionConfigs: CollisionConfig[],
) {
  scene.timer.repeatEvery(4, () => {
    collisionConfigs.forEach(({ type1, type2, onCollision }) => {
      const ids1 = scene.state.typeToIds[type1]
      const ids2 = scene.state.typeToIds[type2]

      ids1.forEach((id1) => {
        const position1 = scene.state.positions.get(id1)
        const radius1 = scene.state.radii.get(id1)

        if (!position1) {
          console.warn(
            `Collision detection failed for type "${type1}", id "${id1}" (no position) (was gonna check with "${type2}")`,
          )
          return
        }
        if (!radius1) {
          console.warn(
            `Collision detection failed for type "${type1}", id "${id1}" (no radius) (was gonna check with "${type2}")`,
          )
          return
        }

        ids2.forEach((id2) => {
          // we don't want to collide once "in each direction" when checking if
          // players collide with other players
          if (type1 == type2 && id1 <= id2) return

          const position2 = scene.state.positions.get(id2)
          const radius2 = scene.state.radii.get(id2)

          if (!position2) {
            console.warn(
              `Collision detection failed for type "${type2}", id "${id2}" (no position) (was gonna check with "${type1}")`,
            )
            return
          }
          if (!radius2) {
            console.warn(
              `Collision detection failed for type "${type2}", id "${id2}" (no radius) (was gonna check with "${type1}")`,
            )
            return
          }

          const distance = getDistance(position1, position2)
          if (distance < radius1 + radius2) {
            onCollision(id1, id2)
          }
        })
      })
    })
  })
}
