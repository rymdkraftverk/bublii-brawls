import {
  sprite,
  htmlText,
  sync,
  graphics,
  container as createContainer,
  createObjectPool,
} from 'alchemy-engine'
import { type Scene } from '~/type'
import pause from './pause'
import controls from './controls'
import { letItSnow } from './snow'

export default async function game(scene: Scene) {
  const {
    textures,
    container,
    input: { isKeyDown, debouncedKey },
    state,
    timer: { repeatEvery },
    sound,
    music,
    timer,
    useScreenShake,
    app,
  } = scene

  // hacky convenience
  // @ts-expect-error TS2339
  window.scene = scene

  const screenShake = useScreenShake(container)
  const background = graphics(container)
  background
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 'chocolate', alpha: 1 })
  background.position.set(0, 0)
  background.zIndex = -100

  letItSnow(container, app.screen.width, app.screen.height)

  const c = createContainer(container)
  c.label = 'container'
  c.position.set(200, 200)

  const _text = htmlText(c, { fontSize: 24, fill: 0xffffff }, 'number 24')
  _text.label = 'number 24'

  const spritePool = createObjectPool(10, () => {
    return sprite(container)
  })
  const s = spritePool.get()
  s.texture = textures['blue-1']
  s.label = 'small blue'
  s.position.set(200, 200)

  sync(_text, 'text', state, 'gold')

  const s2 = sprite(container, textures['blue-1'])
  s2.anchor.set(1)
  s2.label = 'other name'
  s2.position.set(350, 250)
  timer.repeatEvery(10, () => {
    s2.x += 1
  })

  debouncedKey(
    'Space',
    () => {
      screenShake.add(1)
    },
    10,
  )

  repeatEvery(1, (_time, delta) => {
    if (isKeyDown(['a', 'ArrowLeft'])) {
      s.position.x -= 1 * delta
    }
    if (isKeyDown(['w', 'ArrowUp'])) {
      s.position.y -= 1 * delta
    }
    if (isKeyDown(['s', 'ArrowDown'])) {
      s.position.y += 1 * delta
    }
    if (isKeyDown(['d', 'ArrowRight'])) {
      s.position.x += 1 * delta
    }
  })

  state.gold = 42
  repeatEvery(60, () => {
    state.gold++
  })
  // sound.coin.play()
  music.blue_brawls.loop()
  music.blue_brawls.play()
  pause(scene)

  controls(scene, 0)
  // Use this for more players
  controls(scene, 1)
  // controls(scene, 2)
  // controls(scene, 3)
}
