import { graphics } from 'alchemy-engine'
// import type { Type } from '~/data'
import type { Scene } from '~/type'

export default function debug(scene: Scene) {
  const debugGraphics = graphics(scene.container)
  debugGraphics.zIndex = 99999

  // function debugType(type: Type) {
  //   for (const id of scene.state.typeToIds[type]) {
  //     const position = scene.state.positions.get(id)
  //     const radius = scene.state.radii.get(id)
  //
  //     if (!position || !radius) {
  //       console.warn(`Trying to debug "${type}" without position or radius`)
  //       return
  //     }
  //
  //     debugGraphics
  //       .circle(position.x, position.y, radius)
  //       .stroke({ width: 1, color: 'black' })
  //   }
  // }

  scene.timer.repeatEvery(1, () => {
    debugGraphics.clear()
    // debugType('mob')
    // debugType('hazard')
    // debugType('snowBall')
    // debugType('snowPatch')
    // debugType('player')
  })
}
