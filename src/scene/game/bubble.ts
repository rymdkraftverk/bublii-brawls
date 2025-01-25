import { state, type EntityId } from '~/data'
import type { Scene } from '~/type'

const SPEED_X = 3
const SPEED_Y = 3

export const pop = (scene: Scene, entityId: EntityId) => {
    const condition = state.conditions.get(entityId)
    if (!condition || condition !== 'normal') {
        return;
    }

    const targetX = scene.app.screen.width / 2;
    const targetY = scene.app.screen.height / 2;

    const velocity = { x: SPEED_X, y: SPEED_Y }

    state.conditions.set(entityId, 'popping-the-bubble')
    state.velocities.set(entityId, velocity)
    scene.timer.repeatEvery(1, () => {
        const position = state.positions.get(entityId)
        if (!position) {
            return;
        }

        let update = false
        if (velocity.x > 0 && position.x >= targetX) {
            velocity.x = 0
            update = true
        }

        if (velocity.y > 0 && position.y >= targetY) {
            velocity.y = 0
            update = true
        }

        if (update) {
            state.velocities.set(entityId, velocity)
        }
    })
} 