import type { Scene } from '~/type'
import { getGamepads } from './gamepad'

export default function controls(scene: Scene, gamepadIndex: number) {
  scene.timer.repeatEvery(1, (_time, delta) => {
    const gamepads = getGamepads()

    const activeGamepad = gamepads[gamepadIndex]

    if (activeGamepad) {
      const { x, y } = scene.state.velocities.get(gamepadIndex)!
      const mass = scene.state.masses.get(gamepadIndex)!
      scene.state.velocities.set(gamepadIndex, {
        x: x + (activeGamepad.axes.horizontal * delta) / mass,
        y: y + (activeGamepad.axes.vertical * delta) / mass,
      })
    }
  })
}
