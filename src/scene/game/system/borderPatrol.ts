import type { Scene } from '~/type'
import { type EntityId, type Type } from '~/data'

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

        if (y + radius > scene.app.screen.height) {
          onTransgression(id, 'South')
        } else if (y - radius < 0) {
          onTransgression(id, 'North')
        } else if (x + radius > scene.app.screen.width) {
          onTransgression(id, 'East')
        } else if (x - radius < 0) {
          onTransgression(id, 'West')
        }
      }
    }
  })
}
