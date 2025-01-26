import {
  container as createContainer,
  animatedSprite,
  sprite,
  graphics,
  text,
} from 'alchemy-engine'
import { type Scene } from '~/type'
import controls from './controls'
import { sprites, type EntityId, purge, textures, TextStyle } from '~/data'
import { type Sprite } from 'pixi.js'
import * as snow from './snow'
import collisions from './collisions'
import { borderPatrol } from './system/borderPatrol'
import { applyPlayerFriction } from './system/playerFriction'
import mobs, { damageMob, mobSprites, purgeMob } from './mobs'
import * as V from '~/util/vector2d'
import debug from './debug'
import { feed, heal, increaseMass, START_MASS, bublé } from './player'
import { deNormalizeRange, grid } from 'tiny-toolkit'

export default async function game(scene: Scene) {
  const {
    container,
    input: { debouncedKey },
    state,
    timer: { repeatEvery },
    sound: _sound,
    music,
    useScreenShake,
    app,
  } = scene

  // hacky convenience
  // @ts-expect-error TS2339
  window.scene = scene

  const screenShake = useScreenShake(container)
  const bg2 = sprite(container, scene.textures['background-1'])
  bg2.zIndex = -9999
  bg2.scale = 0.5

  snow.letIt(app.screen.width - 30, app.screen.height - 30, scene)

  const c = createContainer(container)
  c.label = 'container'
  c.position.set(200, 200)

  debouncedKey(
    'Space',
    () => {
      screenShake.add(1)
    },
    10,
  )

  textures.set(0, ['player_blue_0-1', 'player_blue_0-2', 'player_blue_0-3'])
  textures.set(1, ['player_green_0-1', 'player_green_0-2', 'player_green_0-3'])
  textures.set(2, [
    'player_purple_0-1',
    'player_purple_0-2',
    'player_purple_0-3',
  ])
  textures.set(3, ['player_red_0-1', 'player_red_0-2', 'player_red_0-3'])

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
      const isBublé = state.bublii.get(id) ?? false
      if (isBublé) continue

      const position = state.positions.get(id)!
      const newPosition = {
        x: position.x + velocity.x * delta,
        y: position.y + velocity.y * delta,
      }
      state.positions.set(id, newPosition)
    }
  })

  repeatEvery(60, (_time, _delta) => {
    const allAreBublé = state.typeToIds['player'].every((playerId) => {
      const isBublé = state.bublii.get(playerId) ?? false
      return isBublé
    })

    if (allAreBublé) {
      const gameOverBackground = createContainer(scene.container)
      gameOverBackground.position.y = 100
      const g = graphics(gameOverBackground)
      g.rect(0, 0, scene.app.screen.width, 60).fill({ color: 0x000000 })
      const t = text(gameOverBackground, TextStyle.MAIN, 'Game over!')
      t.position.x = scene.app.screen.width / 2 - t.width / 2
      t.position.y = 10
      const score = text(
        gameOverBackground,
        TextStyle.MAIN,
        `Score: ${state.alchemy.time}`,
      )
      score.position.x = scene.app.screen.width / 2 - score.width / 2
      score.position.y = 40
      scene.state.alchemy.paused = true
    }
  })

  applyPlayerFriction(scene)

  // sound.coin.play()
  music.blue_brawls.volume(0.2)
  music.blue_brawls.loop()
  music.blue_brawls.play()

  collisions(scene, [
    {
      type1: 'player',
      type2: 'snowPatch',
      onCollision: (playerId, snowPatchId) => {
        if (state.conditions.get(playerId) === 'popping-the-bubble') {
          return
        }

        const isBublé = state.bublii.get(playerId) ?? false
        if (isBublé) {
          return
        }

        const snowPatchMass = state.snowMasses.get(snowPatchId)

        if (snowPatchMass && snowPatchMass > 0) {
          const snowMass = snow.munch(snowPatchId)
          feed(playerId, snowMass, scene)
        }
      },
    },
    {
      type1: 'player',
      type2: 'player',
      onCollision: (p1Id, p2Id) => {
        let isBublé = state.bublii.get(p1Id) ?? false
        if (isBublé) {
          return
        }

        isBublé = state.bublii.get(p2Id) ?? false
        if (isBublé) {
          return
        }

        if (state.conditions.get(p1Id) === 'popping-the-bubble') {
          return
        }

        if (state.conditions.get(p2Id) === 'popping-the-bubble') {
          return
        }

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
          (2 / (1 / m1 + 1 / m2)) * V.dotProduct(direction, V.subtract(v2, v1))
        const newV1 = V.subtract(V.scale(a / m1, direction), v1)
        const newV2 = V.add(V.scale(a / m2, direction), v2)

        scene.state.velocities.set(p1Id, newV1)
        scene.state.velocities.set(p2Id, newV2)

        const radius1 = scene.state.radii.get(p1Id)!
        const radius2 = scene.state.radii.get(p2Id)!
        const midPoint = V.scale(0.5, V.add(p1, p2))
        const newPosition1 = V.add(midPoint, V.scale(radius1, direction))
        const newPosition2 = V.add(
          midPoint,
          V.scale(radius2, V.scale(-1, direction)),
        )

        scene.state.positions.set(p1Id, newPosition1)
        scene.state.positions.set(p2Id, newPosition2)
      },
    },
    {
      type1: 'hazard',
      type2: 'player',
      onCollision: async (_hazard, player) => {
        let isBublé = state.bublii.get(player) ?? false
        if (isBublé) {
          return
        }

        if (state.conditions.get(player) === 'popping-the-bubble') {
          return
        }

        const fireDamage = 500

        increaseMass(player, -1 * fireDamage, scene)
        const condition = scene.state.conditions.get(player)

        if (condition === 'normal') {
          scene.state.conditions.set(player, 'taking-damage')

          const playerSprite = sprites.get(player)!

          const animation = scene.animate.sine({
            onUpdate: (value) => {
              const getR = deNormalizeRange(150, 255)
              // This is blue
              // const tint = { r: getR(value), g: 255, b: 255 }
              const tint = { r: getR(value), g: 0, b: 0 }
              playerSprite.tint = tint
            },
            duration: 30,
          })

          await scene.timer.delay(60)
          animation.cancel()
          playerSprite.tint = 0xffffff
          scene.state.conditions.set(player, 'normal')
        }

        const newMass = scene.state.masses.get(player)!
        if (newMass < START_MASS) {
          bublé(scene, player)
        }
      },
    },
    {
      type1: 'snowBall',
      type2: 'mob',
      onCollision: async (snowBallId, mobId) => {
        const mobHp = damageMob(mobId, snowBallId, scene)
        purge(scene.state, snowBallId)
        if (mobHp === 0) {
          purgeMob(mobId, scene)
        }

        const condition = scene.state.conditions.get(mobId)

        if (condition === 'normal') {
          scene.state.conditions.set(mobId, 'taking-damage')

          const mobSprite = mobSprites.get(mobId)!

          // this is undefined if the mob is dead
          if (!mobSprite) return

          const animation = scene.animate.sine({
            onUpdate: (value) => {
              const getR = deNormalizeRange(255, 0)
              const tint = { r: getR(value), g: getR(value), b: getR(value) }
              mobSprite.character.tint = tint
            },
            duration: 15,
          })

          await scene.timer.delay(45)
          animation.cancel()
          mobSprite.character.tint = 0xffffff
          scene.state.conditions.set(mobId, 'normal')
        }
      },
    },
    {
      type1: 'snowBall',
      type2: 'player',
      onCollision: async (snowBallId, playerId) => {
        const launcherId = state.snowBallLaunchers.get(snowBallId)!
        if (launcherId === playerId) return
        heal(playerId, snowBallId, scene)
        purge(scene.state, snowBallId)

        const playerSprite = sprites.get(playerId)!

        const animation = scene.animate.sine({
          onUpdate: (value) => {
            const getR = deNormalizeRange(150, 255)
            const tint = { r: getR(value), g: 255, b: 255 }
            playerSprite.tint = tint
          },
          duration: 10,
        })

        await scene.timer.delay(30)
        animation.cancel()
        playerSprite.tint = 0xffffff
      },
    },
  ])

  borderPatrol(scene, [
    {
      entityType: 'player',
      onTransgression: (playerId, direction) => {
        const oldPosition = scene.state.positions.get(playerId)!
        const oldVelocity = scene.state.velocities.get(playerId)!
        const radius = scene.state.radii.get(playerId)!
        let newVelocity = oldVelocity
        let newPosition = oldPosition

        const north = { x: 0, y: -1 }
        const east = { x: 1, y: 0 }
        const west = { x: -1, y: 0 }
        const south = { x: 0, y: 1 }

        switch (direction) {
          case 'North':
            if (V.dotProduct(oldVelocity, north) > 0) {
              // newVelocity = { x: oldVelocity.x, y: -0.2 * oldVelocity.y }
              newVelocity = { x: 0, y: 0 }
              newPosition = { x: oldPosition.x, y: 0 + radius + 30 }
            }
            break
          case 'East':
            if (V.dotProduct(oldVelocity, east) > 0) {
              // newVelocity = { x: -0.2 * oldVelocity.x, y: oldVelocity.y }
              newVelocity = { x: 0, y: 0 }
              newPosition = {
                x: scene.app.screen.width - radius - 30,
                y: oldPosition.y,
              }
            }
            break
          case 'South':
            if (V.dotProduct(oldVelocity, south) > 0) {
              // newVelocity = { x: oldVelocity.x, y: -0.2 * oldVelocity.y }
              newVelocity = { x: 0, y: 0 }
              newPosition = {
                x: oldPosition.x,
                y: scene.app.screen.height - radius - 30,
              }
            }
            break
          case 'West':
            if (V.dotProduct(oldVelocity, west) > 0) {
              // newVelocity = { x: -0.2 * oldVelocity.x, y: oldVelocity.y }
              newVelocity = { x: 0, y: 0 }
              newPosition = { x: 0 + radius + 30, y: oldPosition.y }
            }
            break
        }

        scene.state.velocities.set(playerId, newVelocity)
        scene.state.positions.set(playerId, newPosition)
      },
    },
    {
      entityType: 'snowBall',
      onTransgression: (snowBallId, _direction) => {
        purge(scene.state, snowBallId)
      },
    },
  ])

  mobs(scene)
  // TODO: Remove this before release
  debug(scene)
}

const getStartPosition = grid({
  x: 70,
  y: 70,
  marginX: 500,
  marginY: 350,
  breakAt: 2,
})

function createPlayer(
  controllerId: EntityId,
  scene: Scene,
  sprites: Map<EntityId, Sprite>,
) {
  const state = scene.state
  const { x, y } = getStartPosition(controllerId)

  const s = animatedSprite(scene.container)

  s.anchor = 0.5
  // const s = spritePool.get()
  s.textures = textures.get(controllerId)!.map((x) => scene.textures[x])
  s.animationSpeed = 0.1
  s.play()
  s.position.set(x, y)

  state.positions.set(controllerId, { x, y })
  state.velocities.set(controllerId, { x: 0, y: 0 })
  state.conditions.set(controllerId, 'normal')
  state.typeToIds.player.push(controllerId)
  state.types.set(controllerId, 'player')
  state.bublii.set(controllerId, false)
  // state.sprites[controllerId] = s
  sprites.set(controllerId, s)

  increaseMass(controllerId, START_MASS, scene)

  // TODO: Facing
  // scene.timer.repeatEvery(2, () => {
  //   const velocity = scene.state.velocities.get(controllerId)!
  //   console.log('scene.timer.repeatEvery ~ velocity:', velocity.x)

  //   if (velocity.x < 0) {
  //     if (s.scale.x > 0) {
  //       scene.state.facings.set(controllerId, 'left')
  //       s.scale.x *= -1
  //     }
  //   }
  //   if (velocity.x > 0) {
  //     if (s.scale.x < 0) {
  //       scene.state.facings.set(controllerId, 'right')
  //       s.scale.x *= -1
  //     }
  //   }
  // })
}
