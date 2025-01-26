import type { Scene } from '~/type'
import { getGamepads } from './gamepad'
import * as snowBall from './snowBall'
import * as bubble from './bubble'
import { state } from '~/data'

const PLAYER_ACCELERATION = 5

export default function controls(scene: Scene, gamepadIndex: number) {
  scene.timer.repeatEvery(1, (_time, delta) => {
    const gamepads = getGamepads()

    const activeGamepad = gamepads[gamepadIndex]
    if (!activeGamepad) return

    if (state.conditions.get(gamepadIndex) == 'popping-the-bubble') {
      return
    }

    const { x, y } = scene.state.velocities.get(gamepadIndex)!
    const mass = scene.state.masses.get(gamepadIndex)!
    scene.state.velocities.set(gamepadIndex, {
      x:
        x +
        (activeGamepad.axes.horizontal * delta * PLAYER_ACCELERATION) /
          mass ** 0.5,
      y:
        y +
        (activeGamepad.axes.vertical * delta * PLAYER_ACCELERATION) /
          mass ** 0.5,
    })

    if (Math.abs(activeGamepad.axes.horizontal) + Math.abs(activeGamepad.axes.vertical) < 0.2) {
      scene.state.velocities.set(gamepadIndex, {x:0, y:0})
    }

    const aim = Math.atan2(
      activeGamepad.axesRight.vertical,
      activeGamepad.axesRight.horizontal,
    )
    scene.state.aims.set(gamepadIndex, aim)

    if (activeGamepad.rightTrigger > 0.5) {
      if (!scene.state.throwSnowBallIsOnCooldown.get(gamepadIndex)) {
        const angle = scene.state.aims.get(gamepadIndex) ?? 0
        snowBall.launch(scene, gamepadIndex, angle)

        scene.state.throwSnowBallIsOnCooldown.set(gamepadIndex, true)
        turnOffCooldownInOneSecond(scene, gamepadIndex)
      }
    }

    if (activeGamepad.buttons[0]) {
      bubble.pop(scene, gamepadIndex)
    }
  })
}

async function turnOffCooldownInOneSecond(scene: Scene, gamepadIndex: number) {
  await scene.timer.delay(snowBall.COOLDOWN)

  scene.state.throwSnowBallIsOnCooldown.set(gamepadIndex, false)
}
