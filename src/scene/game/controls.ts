import type { Scene } from '~/type'
import { getGamepads } from './gamepad'

export default function controls(scene: Scene, gamepadIndex: number) {
  scene.timer.repeatEvery(1, (_time, delta) => {
    const gamepads = getGamepads()

    const activeGamepad = gamepads[gamepadIndex]

    if (activeGamepad) {
      // scene.state.positions[gamepadIndex]!.x += activeGamepad.axes.horizontal * delta
      // scene.state.positions[gamepadIndex]!.y += activeGamepad.axes.vertical * delta
      const {x,y} = scene.state.positions.get(gamepadIndex)!
      scene.state.positions.set(
        gamepadIndex,
        {
          x: x + activeGamepad.axes.horizontal * delta,
          y: y + activeGamepad.axes.vertical * delta
        })

      console.log('horizontal', activeGamepad.axes.horizontal)
      console.log('vertical', activeGamepad.axes.vertical)
    }
  })
}
