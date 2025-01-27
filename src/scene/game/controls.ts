import type { Scene } from '~/type'
import { getGamepads } from './gamepad'
import * as snowBall from './snowBall'
import * as bubble from './bubble'
import { state } from '~/data'
import { createPlayer } from '.'

const PLAYER_ACCELERATION = 1

const controls = (scene: Scene, gamepadIndex: number) => {
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

    if (
      Math.abs(activeGamepad.axes.horizontal) +
        Math.abs(activeGamepad.axes.vertical) <
      0.2
    ) {
      scene.state.velocities.set(gamepadIndex, { x: 0, y: 0 })
    }

    if (
      Math.abs(activeGamepad.axesRight.horizontal) +
        Math.abs(activeGamepad.axesRight.vertical) >
      0.2
    ) {
      const aim = Math.atan2(
        activeGamepad.axesRight.vertical,
        activeGamepad.axesRight.horizontal,
      )

      scene.state.aims.set(gamepadIndex, aim)
    } else {
      scene.state.aims.delete(gamepadIndex)
    }

    if (activeGamepad.rightTrigger > 0.5) {
      const hasCooldown =
        scene.state.throwSnowBallIsOnCooldown.get(gamepadIndex)
      // console.log({ hasCooldown })
      if (!hasCooldown) {
        const angle = scene.state.aims.get(gamepadIndex)

        if (!angle) return

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

export const initScanForControls = (scene: Scene) => {
  scanForControls(scene)
  scene.timer.repeatEvery(60, (_time, _delta) => {
    scanForControls(scene)
  })
}

const scanForControls = (scene: Scene) => {
  const gamepads = navigator.getGamepads().filter((x) => !!x)
  const newGamepadCount = gamepads.length
  const oldGamepadCount = state.controllers
  const playerDelta = newGamepadCount - oldGamepadCount

  if (playerDelta === 0) return

  state.controllers = newGamepadCount

  if (playerDelta > 0) {
    console.log(`${playerDelta} PLAYER(S) JOINED`)
    for (let i = oldGamepadCount; i < newGamepadCount; i++) {
      createPlayer(i, scene)
      controls(scene, i)
    }
  } else {
    console.log(`${Math.abs(playerDelta)} PLAYER(S) LEFT`)
  }
}
