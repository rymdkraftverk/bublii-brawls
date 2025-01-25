import { getDistance } from 'tiny-toolkit'
import { type EntityId, type Type } from '~/data'
import type { Scene } from '~/type'

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
    for (const { type1, type2, onCollision } of collisionConfigs) {
      const ids1 = scene.state.typeToIds[type1]
      const ids2 = scene.state.typeToIds[type2]

      for (const id1 of ids1) {
        const position1 = scene.state.positions.get(id1)
        const radius1 = scene.state.radii.get(id1)

        if (!position1 || !radius1) {
          throw new Error('Collision detection failed !!!!11oneone')
        }

        for (const id2 of ids2) {
          // nothing can collide with itself
          if (id1 == id2) continue

          const position2 = scene.state.positions.get(id2)
          const radius2 = scene.state.radii.get(id2)

          if (!position2 || !radius2) {
            throw new Error('Collision detection failed !!!!11oneone')
          }

          const distance = getDistance(position1, position2)
          if (distance < radius1 + radius2) {
            onCollision(id1, id2)
          }
        }
      }
    }
  })
}
