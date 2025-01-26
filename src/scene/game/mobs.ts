import {
  animatedSprite,
  container,
  createObjectPool,
  sprite,
  type ObjectPool,
  type Position,
} from 'alchemy-engine'
import ParkMiller from 'park-miller'
import type { AnimatedSprite, Container, Sprite } from 'pixi.js'
import { getDistance, getRandomInt } from 'tiny-toolkit'
import { getNextId, purge, state, type EntityId } from '~/data'
import type { Scene, TextureName } from '~/type'
import { normalize, scale, subtract } from '~/util/vector2d'
import * as V from '~/util/vector2d'
import { MAX_MASS, START_MASS } from './player'
import { SNOWBALL_AREA_FACTOR } from './snowBall'

const MAXIMUM_SPEED = 1.5
const TNT_COUNTDOWN_TIME = 120

export const FULL_HP = 5

// This breaks if imported in different file, WTF
export enum MobType {
  FLAMETHROWER = 'flamethrower',
  TNT = 'tnt',
  MOLOTOV = 'molotov',
}

const weaponTextureMap: Record<MobType, TextureName> = {
  [MobType.FLAMETHROWER]: 'flamethrower_0-1',
  [MobType.TNT]: 'tnt_0-1',
  [MobType.MOLOTOV]: 'molotov_0-1',
}

const projectileTextureMap: Record<MobType, TextureName[]> = {
  [MobType.FLAMETHROWER]: [
    'flamethrower_flame_0-1',
    'flamethrower_flame_0-2',
    'flamethrower_flame_0-3',
  ],
  [MobType.TNT]: ['tnt_0-1'],
  [MobType.MOLOTOV]: ['molotov_0-1'],
}

const weaponPositionMap: Record<MobType, Position> = {
  [MobType.FLAMETHROWER]: { x: -13, y: -15 },
  [MobType.TNT]: {
    x: -4,
    y: -12,
  },
  [MobType.MOLOTOV]: {
    x: -18,
    y: -19,
  },
}

const hazardRadiusMap: Record<MobType, number> = {
  [MobType.FLAMETHROWER]: 15,
  [MobType.TNT]: 100,
  [MobType.MOLOTOV]: 100,
}

type Wave = { type: MobType }
const waves: Wave[] = [
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
  { type: MobType.FLAMETHROWER },
  { type: MobType.TNT },
]

export const mobSprites = new Map<
  EntityId,
  {
    con: Container
    character: AnimatedSprite
    weapon: Sprite
    hazardSprite: AnimatedSprite
  }
>()

let mobPool: ObjectPool<{
  con: Container
  character: AnimatedSprite
  weapon: Sprite
  hazardSprite: AnimatedSprite
}>

const targetMap = new Map<EntityId, number>()
const mobToHazardMap = new Map<EntityId, EntityId>()

export default async function mobs(scene: Scene) {
  const wave = waves[0]

  if (!wave) {
    throw new Error('No wave data!!')
  }

  const createObject = () => {
    const con = container(scene.container)
    con.visible = true
    const character = animatedSprite(con)
    character.visible = true
    character.textures = [
      scene.textures['lizard_green_0-1'],
      scene.textures['lizard_green_0-2'],
    ]
    character.animationSpeed = 0.05
    character.play()
    character.scale = 0.5
    character.anchor = 0.5
    const weapon = sprite(con)
    weapon.visible = true
    const hazardSprite = animatedSprite(con)
    hazardSprite.visible = true
    return { con, character, weapon, hazardSprite }
  }

  mobPool = createObjectPool(30, createObject)

  await scene.timer.delay(30)

  async function createMob(wave: Wave) {
    const mobId = getNextId()
    scene.state.typeToIds.mob.push(mobId)
    const mobPosition = { x: scene.app.screen.width / 2, y: -20 }
    scene.state.positions.set(mobId, mobPosition)
    scene.state.conditions.set(mobId, 'normal')
    scene.state.facings.set(mobId, 'right')
    scene.state.radii.set(mobId, 10)
    scene.state.mobHps.set(mobId, FULL_HP)

    const poolObject = mobPool.get()
    const { con, character, weapon, hazardSprite } = poolObject
    con.visible = true
    character.visible = true
    weapon.visible = true
    mobSprites.set(mobId, poolObject)
    weapon.texture = scene.textures[weaponTextureMap[wave.type]]
    weapon.position = weaponPositionMap[wave.type]
    weapon.scale = 0.5

    hazardSprite.visible = false
    hazardSprite.scale = 1

    await scene.timer.repeatUntil(90, () => {
      const position = scene.state.positions.get(mobId)
      if (!position) {
        // Mob was purged
        return
      }
      position.y += 1
    })

    const random = new ParkMiller(getRandomInt())
    const targetId = random.integerInRange(0, 3)
    targetMap.set(mobId, targetId)
    await scene.timer.delay(10)

    if (wave.type === MobType.FLAMETHROWER) {
      const hazard = getNextId()
      scene.state.typeToIds.hazard.push(hazard)
      mobToHazardMap.set(mobId, hazard)
      scene.state.hazardToMobType.set(hazard, wave.type)
      hazardSprite.textures = projectileTextureMap[wave.type].map(
        (x) => scene.textures[x],
      )
      hazardSprite.position = { x: 15, y: 8 }
      hazardSprite.animationSpeed = 0.1
      hazardSprite.play()
      hazardSprite.anchor.y = 0.5

      scene.state.radii.set(hazard, hazardRadiusMap[wave.type])
      scene.state.positions.set(hazard, {
        y: mobPosition.y,
        x: mobPosition.x,
      })
      hazardSprite.visible = true

      scene.timer.repeatEvery(1, () => {
        const mobFacing = scene.state.facings.get(mobId)
        const mobPosition = scene.state.positions.get(mobId)

        if (!mobPosition || !mobFacing) {
          // Mob was purged
          return
        }

        scene.state.positions.set(hazard, {
          y: mobPosition.y + 5,
          x: mobFacing === 'left' ? mobPosition.x - 60 : mobPosition.x + 60,
        })
      })
    } else if (wave.type === MobType.TNT) {
      await scene.timer.delay(TNT_COUNTDOWN_TIME)
      hazardSprite.visible = true
      const tntTextures: TextureName[] = [
        'tnt_explode_0-1',
        'tnt_explode_0-2',
        'tnt_explode_0-3',
        'tnt_explode_0-4',
        'tnt_explode_0-5',
        'tnt_explode_0-6',
        'tnt_explode_0-7',
        'tnt_explode_0-8',
        'tnt_explode_0-9',
      ]
      hazardSprite.textures = tntTextures.map((x) => scene.textures[x])
      hazardSprite.animationSpeed = 0.05
      hazardSprite.loop = false
      hazardSprite.play()
      hazardSprite.onComplete = () => {
        const hazard = getNextId()
        scene.state.typeToIds.hazard.push(hazard)
        scene.state.radii.set(hazard, hazardRadiusMap[wave.type])
        const _mobPosition = scene.state.positions.get(mobId)

        if (!_mobPosition) {
          return
        }
        scene.state.positions.set(hazard, {
          y: _mobPosition.y,
          x: _mobPosition.x,
        })

        const explosionTextures: TextureName[] = [
          'explosion_0-1',
          'explosion_0-2',
          'explosion_0-3',
          'explosion_0-4',
          'explosion_0-5',
          'explosion_0-6',
          'explosion_0-7',
        ]
        hazardSprite.textures = explosionTextures.map((x) => scene.textures[x])
        hazardSprite.anchor = 0.5
        hazardSprite.scale = 5
        hazardSprite.animationSpeed = 0.1
        hazardSprite.loop = false
        hazardSprite.play()
        hazardSprite.onComplete = () => {
          con.visible = false
          purgeMob(mobId, scene)
        }

        character.visible = false
        weapon.visible = false
      }
    }
  }

  function render() {
    for (const mobId of scene.state.typeToIds.mob) {
      const position = scene.state.positions.get(mobId)!
      const { con } = mobSprites.get(mobId)!
      con.position = position
    }
  }
  scene.timer.repeatEvery(1, () => {
    render()
  })

  scene.timer.repeatEvery(30, (_) => {
    const mobIds = scene.state.typeToIds.mob
    mobIds.forEach((mobId) => {
      const mobPosition = scene.state.positions.get(mobId)!

      const { playerId } = scene.state.typeToIds.player
        .filter((pId) => {
          return !scene.state.bublii.get(pId)
        })
        .filter((pId) => {
          return state.conditions.get(pId) !== 'popping-the-bubble'
        })
        .map((pId) => {
          const playerPosition = scene.state.positions.get(pId)!
          const distance = V.length(V.subtract(mobPosition, playerPosition))

          return { playerId: pId, distance: distance }
        })
        .reduce(
          (previousValue, otherCandidate) => {
            if (otherCandidate.distance < previousValue.distance) {
              return otherCandidate
            }

            return previousValue
          },
          { playerId: targetMap.get(mobId)!, distance: Number.MAX_VALUE },
        )

      targetMap.set(mobId, playerId)
    })
  })

  // Move towards
  scene.timer.repeatEvery(1, (_time, delta) => {
    const mobIds = scene.state.typeToIds.mob
    mobIds.forEach((mobId) => {
      const targetId = targetMap.get(mobId)
      if (targetId !== undefined) {
        const targetPosition = scene.state.positions.get(targetId)!
        const mobPosition = scene.state.positions.get(mobId)!

        // targetPosition should be to the left or to the right of the target
        const leftOfTarget = { ...targetPosition, x: targetPosition.x - 40 }
        const rightOfTarget = { ...targetPosition, x: targetPosition.x + 40 }

        const leftOfTargetDistance = getDistance(mobPosition, leftOfTarget)
        const rightOfTargetDistance = getDistance(mobPosition, rightOfTarget)

        const targetDistance = Math.min(
          leftOfTargetDistance,
          rightOfTargetDistance,
        )

        const { con } = mobSprites.get(mobId)!
        const facing = scene.state.facings.get(mobId)

        if (targetDistance < 15) {
          scene.state.velocities.set(mobId, { x: 0, y: 0 })

          if (
            V.dotProduct(
              { x: 1, y: 0 },
              V.subtract(mobPosition, targetPosition),
            ) > 0
          ) {
            if (facing === 'left' && con.scale.x < 0) {
              scene.state.facings.set(mobId, 'right')
              con.scale.x *= -1
            }
          } else {
            if (facing === 'right' && con.scale.x > 0) {
              scene.state.facings.set(mobId, 'left')
              con.scale.x *= -1
            }
          }

          return
        }

        const direction = normalize(
          subtract(
            mobPosition,
            leftOfTargetDistance < rightOfTargetDistance ? leftOfTarget : (
              rightOfTarget
            ),
          ),
        )
        // delta here seems to always be 1
        const velocity = scale(MAXIMUM_SPEED * delta, direction)
        scene.state.velocities.set(mobId, velocity)

        if (direction.x < 0) {
          if (con.scale.x > 0 && facing === 'right') {
            scene.state.facings.set(mobId, 'left')
            con.scale.x *= -1
          }
        }
        if (direction.x > 0) {
          if (con.scale.x < 0 && facing === 'left') {
            scene.state.facings.set(mobId, 'right')
            con.scale.x *= -1
          }
        }
      }
    })
  })

  for await (const [index, wave] of waves.entries()) {
    createMob(wave)
    await scene.timer.delay(Math.max(70, 300 - index * 15))
  }
}

export function purgeMob(mobId: EntityId, scene: Scene) {
  purge(scene.state, mobId)
  if (mobPool) {
    const obj = mobSprites.get(mobId)

    if (obj) {
      mobPool.release(obj)
      obj.character.visible = false
      obj.weapon.visible = false
      obj.hazardSprite.visible = false
      mobSprites.delete(mobId)
    }

    purge(scene.state, mobToHazardMap.get(mobId)!)
  }
}

export const damageMob = (
  mobId: EntityId,
  snowballId: EntityId,
  scene: Scene
) => {
  const mobHp = scene.state.mobHps.get(mobId)!
  const damage = computeDamage(snowballId)
  console.log({ damage })
  const newHp = Math.max(mobHp - damage, 0)
  scene.state.mobHps.set(mobId, newHp)
  return newHp
}

const SNOWBALL_MIN_MASS = START_MASS * SNOWBALL_AREA_FACTOR
const SNOWBALL_MAX_MASS = MAX_MASS * SNOWBALL_AREA_FACTOR
const computeDamage = (snowballId: EntityId) => {
  const mass = state.masses.get(snowballId)!
  return normalizeToHtp(mass)
}

const MIN_HP = 1
function normalizeToHtp(
  value: number,
): number {
  return ((
    value - SNOWBALL_MIN_MASS
  ) * (FULL_HP - MIN_HP)) / (SNOWBALL_MAX_MASS - SNOWBALL_MIN_MASS) + MIN_HP;
}
