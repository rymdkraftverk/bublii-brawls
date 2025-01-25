import {
  sprite,
  graphics,
  container as createContainer,
  createObjectPool,
} from 'alchemy-engine'
import { type Scene } from '~/type'
import pause from './pause'
import controls from './controls'
import { sprites, state, type EntityId } from '~/data'
import { type Sprite } from 'pixi.js'
import * as snow from './snow'
import * as snowBall from './snowBall'
import collisions from './collisions'

export default async function game(scene: Scene) {
  const {
    textures,
    container,
    input: { isKeyDown, debouncedKey },
    state,
    timer: { repeatEvery },
    sound: _sound,
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

  snow.letIt(app.screen.width, app.screen.height, container, repeatEvery)

  const c = createContainer(container)
  c.label = 'container'
  c.position.set(200, 200)

  const spritePool = createObjectPool(10, () => {
    return sprite(container)
  })
  const s = spritePool.get()
  s.texture = textures['blue-1']
  s.label = 'small blue'
  s.position.set(200, 200)

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

  const controllerIds = [0, 1, 2, 3]
  // const controllerIds : Array<EntityId> = []

  for (const controllerId of controllerIds) {
    createPlayer(controllerId, scene, sprites)

    controls(scene, controllerId)
  }

  repeatEvery(1, (_time, delta) => {
    for (const [id, entitySprite] of sprites.entries()) {
      const position = state.positions.get(id)!
      entitySprite.position = position
    }

    for (const [id, velocity] of state.velocities.entries()) {
      const position = state.positions.get(id)!
      const newPosition = {
        x: position.x + velocity.x * delta,
        y: position.y + velocity.y * delta,
      }
      state.positions.set(id, newPosition)
    }
  })

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

  // WIP
  delaySnowBallFromPlayer(scene, 1)

  // sound.coin.play()
  music.blue_brawls.loop()
  music.blue_brawls.play()
  pause(scene)

  /*
  controls(scene, 0)
  // Use this for more players
  controls(scene, 1)
  // controls(scene, 2)
  // controls(scene, 3)
  */
  collisions(scene, [
    {
      type1: 'player',
      type2: 'snowPatch',
      onCollision: (_playerId, snowPatchId) => {
        const snowPatchMass = state.snowMasses.get(snowPatchId)

        if (snowPatchMass && snowPatchMass > 0) {
          snow.munch(snowPatchId)
        }
      },
    },
  ])
}

const delaySnowBallFromPlayer = async (scene: Scene, playerIndex: number) => {
  await scene.timer.delay(50)
  const firstPlayer = state.typeToIds['player'].at(playerIndex)!
  snowBall.launch(scene, firstPlayer, Math.PI * 2)
}

function createPlayer(
  controllerId: EntityId,
  scene: Scene,
  sprites: Map<EntityId, Sprite>,
) {
  const state = scene.state
  const x = 200 + (controllerId - 2) * 100
  const y = 200 + (controllerId - 2) * 100

  const s = sprite(scene.container)
  s.anchor = 0.5
  // const s = spritePool.get()
  s.texture = scene.textures['blue-1']
  s.position.set(x, y)

  state.positions.set(controllerId, { x, y })
  state.radii.set(controllerId, 40)
  state.types.set(controllerId, 'player')
  state.velocities.set(controllerId, { x: 0, y: 0 })
  state.masses.set(controllerId, 10)
  state.typeToIds.player.push(controllerId)
  // state.sprites[controllerId] = s
  sprites.set(controllerId, s)
}
