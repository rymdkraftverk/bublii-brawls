import type { Scene } from '~/type'
import { getGamepads } from './gamepad'

export default function controls(scene: Scene, gamepadIndex: number) {
  scene.timer.repeatEvery(1, (time, delta) => {
    const gamepads = getGamepads()

    const activeGamepad = gamepads.find((g) => g?.index === gamepadIndex)
  })
}
