import {
  container as createContainer,
  sprite,
  graphics,
  text,
} from 'alchemy-engine'
import { type Scene } from '~/type'
import { initScanForControls } from './controls'
import { sprites, purge, textures, TextStyle } from '~/data'
import * as snow from './snow'
import collisions from './collisions'
import { borderPatrol } from './system/borderPatrol'
import { applyPlayerFriction } from './system/playerFriction'
import mobs, { damageMob, mobSprites, purgeMob } from './mobs'
import * as V from '~/util/vector2d'
import debug from './debug'
import {
  feed,
  heal,
  increaseMass,
  START_MASS,
  MAX_MASS,
  bublé,
  jumpBack,
} from './player'
import { deNormalizeRange } from 'tiny-toolkit'

export default async function game(scene: Scene) {
  const {
    container,
    state,
    timer: { repeatEvery },
    sound,
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

  textures.set(0, ['player_blue_0-1', 'player_blue_0-2', 'player_blue_0-3'])
  textures.set(1, ['player_green_0-1', 'player_green_0-2', 'player_green_0-3'])
  textures.set(2, [
    'player_purple_0-1',
    'player_purple_0-2',
    'player_purple_0-3',
  ])
  textures.set(3, ['player_red_0-1', 'player_red_0-2', 'player_red_0-3'])

  music.blue_brawls.volume(0.5)
  music.reptile_dysfunction.volume(0.25)
  sound.explosion.volume(0.1)
  sound['SFX_hit&damage2'].volume(0.4)
  sound['SFX_powerUp2a'].volume(0.4)
  sound['SFX_wrong&malus4'].volume(0.4)

  initScanForControls(scene)

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
    const ticks = state.alchemy.time

    // give players ~5 sec to start moving
    if (ticks < 5 * 60) return

    const players = state.typeToIds['player']
    const allAreBublé = players.every((playerId) => {
      const isBublé = state.bublii.get(playerId) ?? false
      return isBublé
    })

    if (allAreBublé) {
      const failedToJoinInTime = players.length === 0

      const textContent =
        failedToJoinInTime ?
          'No player connected\nConnect a gamepad and try again'
        : 'Game over!'

      const gameOverBackground = createContainer(scene.container)
      gameOverBackground.position.y = 100
      const g = graphics(gameOverBackground)
      g.rect(0, 0, scene.app.screen.width, 60).fill({ color: 0x000000 })
      const t = text(gameOverBackground, TextStyle.MAIN, textContent)
      t.position.x = scene.app.screen.width / 2 - t.width / 2
      t.position.y = 10
      if (!failedToJoinInTime) {
        const score = text(
          gameOverBackground,
          TextStyle.MAIN,
          `Score: ${ticks}`,
        )
        score.position.x = scene.app.screen.width / 2 - score.width / 2
        score.position.y = 40
      }
      scene.state.alchemy.paused = true

      music.blue_brawls.stop()
      music.reptile_dysfunction.play()
    }
  })

  applyPlayerFriction(scene)

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
        jumpBack(p1Id)
        jumpBack(p2Id)
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

        const fireDamage =
          state.types.get(_hazard) === 'tnt' ? 50000 / 7.5 : 500

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

        const hitPlayerMass = state.masses.get(playerId)!
        if (hitPlayerMass === MAX_MASS) return

        heal(playerId, snowBallId, scene)
        purge(scene.state, snowBallId)

        const playerSprite = sprites.get(playerId)!
        scene.sound['SFX_powerUp2a'].play()
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
              newVelocity = { x: oldVelocity.x * 0.9, y: 0 }
              newPosition = { x: oldPosition.x, y: 0 + radius + 30 }
            }
            break
          case 'East':
            if (V.dotProduct(oldVelocity, east) > 0) {
              newVelocity = { x: 0, y: oldVelocity.y * 0.9 }
              newPosition = {
                x: scene.app.screen.width - radius - 30,
                y: oldPosition.y,
              }
            }
            break
          case 'South':
            if (V.dotProduct(oldVelocity, south) > 0) {
              newVelocity = { x: oldVelocity.x * 0.9, y: 0 }
              newPosition = {
                x: oldPosition.x,
                y: scene.app.screen.height - radius - 30,
              }
            }
            break
          case 'West':
            if (V.dotProduct(oldVelocity, west) > 0) {
              newVelocity = { x: 0, y: oldVelocity.y * 0.9 }
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

  mobs(scene, screenShake, sound)
  // TODO: Remove this before release
  debug(scene)
}
