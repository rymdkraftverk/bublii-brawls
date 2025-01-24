import type { Scene } from '~/type'
import { getGamepads } from './gamepad'

export default function controls(scene: Scene, gamepadIndex: number) {
  const gamepads = getGamepads()

  scene.timer.repeatEvery(1, (time, delta) => {
    const activeGamepad = gamepads.find((g) => g?.index === gamepadIndex)

    if (activeGamepad?.axes.left) {
      console.log(activeGamepad?.axes.left)
    }
  })
}
