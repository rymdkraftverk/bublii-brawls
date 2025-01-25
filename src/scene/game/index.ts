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
import { applyPlayerFriction } from './system/playerFriction'
import mobs from './mobs'
import * as V from '~/util/vector2d'
import debug from './debug'
import { setRadius } from './player'

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

  debouncedKey(
    'Space',
    () => {
      screenShake.add(1)
    },
    10,
  )

  const controllerIds = [0, 1, 2, 3]

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

  applyPlayerFriction(scene)

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
  launchSnowBallFromPlayer(scene, 1)
  repeatEvery(100, (_time, _delta) => {
    launchSnowBallFromPlayer(scene, 0)
  })

  // sound.coin.play()
  music.blue_brawls.loop()
  music.blue_brawls.play()
  pause(scene)

  collisions(scene, [
    {
      type1: 'player',
      type2: 'snowPatch',
      onCollision: (playerId, snowPatchId) => {
        const snowPatchMass = state.snowMasses.get(snowPatchId)

        if (snowPatchMass && snowPatchMass > 0) {
          const snowMass = snow.munch(snowPatchId)
          const playerRadius = state.radii.get(playerId)!
          const grownPlayerRadius = playerRadius + snowMass / 100

          setRadius(playerId, grownPlayerRadius)
        }
      },
    },
    {
      type1: 'player',
      type2: 'player',
      onCollision: (p1Id, p2Id) => {
        const p1 = scene.state.positions.get(p1Id)
        const p2 = scene.state.positions.get(p2Id)

        const v1 = scene.state.velocities.get(p1Id)
        const v2 = scene.state.velocities.get(p2Id)

        const m1 = scene.state.masses.get(p1Id)
        const m2 = scene.state.masses.get(p2Id)

        if (!p1 || !p2 || !v1 || !v2 || !m1 || !m2) {
          console.log(
            'position, velocity or mass is missing when players collide',
          )
          return
        }
        if (m1 == 0 || m2 == 0) {
          console.log('mass is zero in one of colliding players')
          return
        }

        // I took these calculations from my asteroids game, don't ask me to
        // explain it
        const direction = V.normalize(V.subtract(p2, p1))
        const a =
          (2 / (1 / m1 + 1 / m2)) *
          V.dotProduct(direction, V.add(v1, V.scale(-1, v2)))
        const newV1 = V.subtract(V.scale(a / m1, direction), v1)
        const newV2 = V.add(V.scale(a / m2, direction), v2)

        scene.state.velocities.set(p1Id, newV1)
        scene.state.velocities.set(p2Id, newV2)
      },
    },
  ])

  mobs(scene)
  // TODO: Remove this before release
  debug(scene)
}

const launchSnowBallFromPlayer = async (scene: Scene, playerIndex: number) => {
  const firstPlayer = state.typeToIds['player'].at(playerIndex)!
  const angle = state.aims.get(playerIndex) ?? Math.PI * 2
  snowBall.launch(scene, firstPlayer, angle)
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
  state.types.set(controllerId, 'player')
  state.velocities.set(controllerId, { x: 0, y: 0 })
  state.typeToIds.player.push(controllerId)
  // state.sprites[controllerId] = s
  sprites.set(controllerId, s)

  setRadius(controllerId, 20)
}
