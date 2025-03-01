import type { Scene } from '~/type.js'
import { type EntityId, type Type } from '~/data.js'

export type Direction = 'North' | 'East' | 'South' | 'West'

export type BorderPatrolConfig = {
  entityType: Type
  onTransgression: (entityId: EntityId, direction: Direction) => void
}

export function borderPatrol(
  scene: Scene,
  borderPatrolConfig: BorderPatrolConfig[],
) {
  scene.timer.repeatEvery(4, () => {
    for (const { entityType, onTransgression } of borderPatrolConfig) {
      let entityIds = []

      switch (entityType) {
        case 'player':
          entityIds = scene.state.typeToIds.player
          break
        case 'snowBall':
          entityIds = scene.state.typeToIds.snowBall
          break
        default:
          throw `unsupported border patrol type ${entityType}`
      }

      for (const id of entityIds) {
        const radius = scene.state.radii.get(id)!
        const { x, y } = scene.state.positions.get(id)!

        if (y + radius > scene.app.screen.height - 30) {
          onTransgression(id, 'South')
        } else if (y - radius < 30) {
          onTransgression(id, 'North')
        } else if (x + radius > scene.app.screen.width - 30) {
          onTransgression(id, 'East')
        } else if (x - radius < 30) {
          onTransgression(id, 'West')
        }
      }
    }
  })
}
