import type { Scene } from '~/type'
import { getGamepads } from './gamepad'
import * as snowBall from './snowBall'

const PLAYER_ACCELERATION = 100

export default function controls(scene: Scene, gamepadIndex: number) {
  scene.timer.repeatEvery(1, (_time, delta) => {
    const gamepads = getGamepads()

    const activeGamepad = gamepads[gamepadIndex]
    if (!activeGamepad) return

    const { x, y } = scene.state.velocities.get(gamepadIndex)!
    const mass = scene.state.masses.get(gamepadIndex)!
    scene.state.velocities.set(gamepadIndex, {
      x:
        x +
        (activeGamepad.axes.horizontal * delta * PLAYER_ACCELERATION) / mass,
      y: y + (activeGamepad.axes.vertical * delta * PLAYER_ACCELERATION) / mass,
    })

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
  })
}

async function turnOffCooldownInOneSecond(scene: Scene, gamepadIndex: number) {
  await scene.timer.delay(snowBall.COOLDOWN)

  scene.state.throwSnowBallIsOnCooldown.set(gamepadIndex, false)
}
