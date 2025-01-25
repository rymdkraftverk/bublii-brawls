import {
  animatedSprite,
  container,
  createObjectPool,
  graphics,
  sprite,
  text,
  type Position,
} from 'alchemy-engine'
import ParkMiller from 'park-miller'
import { getDistance, getRandomInt } from 'tiny-toolkit'
import { getNextId, TextStyle, type EntityId } from '~/data'
import type { Scene, TextureName } from '~/type'
import { normalize, scale, subtract } from '~/util/vector2d'

const MAXIMUM_SPEED = 3
const TNT_COUNTDOWN_TIME = 120

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
const waves: Wave[] = [{ type: MobType.TNT }]

export default async function mobs(scene: Scene) {
  const wave = waves[0]

  if (!wave) {
    throw new Error('No wave data!!')
  }

  await scene.timer.delay(30)
  startWave(scene, wave)
  // TODO: Enable for more waves
  // scene.timer.repeatEvery(300, () => {
  //   startWave(scene, wave)
  // })
}

async function startWave(scene: Scene, wave: Wave) {
  const mobSprites = createObjectPool(30, () => {
    const con = container(scene.container)
    const character = animatedSprite(con)
    const weapon = sprite(con)
    const hazardSprite = animatedSprite(con)
    return { con, character, weapon, hazardSprite }
  })

  const mobId = getNextId()
  scene.state.typeToIds.mob.push(mobId)

  const mobPosition = { x: scene.app.screen.width / 2, y: -20 }
  scene.state.positions.set(mobId, mobPosition)
  scene.state.radii.set(mobId, 50)

  const { con, character, weapon, hazardSprite } = mobSprites.get()
  character.textures = [
    scene.textures['lizard_green_0-1'],
    scene.textures['lizard_green_0-2'],
  ]
  character.animationSpeed = 0.05
  character.play()
  character.scale = 0.5
  character.anchor = 0.5

  weapon.texture = scene.textures[weaponTextureMap[wave.type]]
  weapon.position = weaponPositionMap[wave.type]
  weapon.scale = 0.5

  hazardSprite.textures = projectileTextureMap[wave.type].map(
    (x) => scene.textures[x],
  )
  hazardSprite.visible = false
  hazardSprite.position = { x: 15, y: 8 }
  hazardSprite.animationSpeed = 0.1
  hazardSprite.play()
  hazardSprite.anchor.y = 0.5

  function render() {
    for (const mobId of scene.state.typeToIds.mob) {
      const position = scene.state.positions.get(mobId)!
      con.position = position
    }
  }
  scene.timer.repeatEvery(1, () => {
    render()
  })

  await scene.timer.repeatUntil(90, () => {
    const position = scene.state.positions.get(mobId)!
    position.y += 1
  })

  const speechBubble = container(scene.container)
  speechBubble.position = {
    x: con.position.x,
    y: con.position.y - 50,
  }
  const g = graphics(speechBubble)
  g.roundRect(-10, -10, 180, 30)
    .fill({ color: '#ffffff' })
    .stroke({ width: 1, color: '#000000' })
  text(speechBubble, { ...TextStyle.MAIN, fill: '0x000000' }, 'Burn bitches!')

  await scene.timer.delay(60)

  const hazard = getNextId()
  scene.state.typeToIds.hazard.push(hazard)
  const radius = hazardRadiusMap[wave.type]
  scene.state.radii.set(hazard, radius)

  speechBubble.destroy()

  // Set an initial position
  scene.state.positions.set(hazard, {
    y: mobPosition.y,
    x: mobPosition.x,
  })

  if (wave.type === MobType.FLAMETHROWER) {
    hazardSprite.visible = true

    scene.timer.repeatEvery(1, () => {
      const mobFacing = scene.state.facings.get(mobId) ?? 'left'
      const mobPosition = scene.state.positions.get(mobId)!

      scene.state.positions.set(hazard, {
        y: mobPosition.y + 5,
        x: mobFacing === 'left' ? mobPosition.x - 60 : mobPosition.x + 60,
      })
    })
  } else if (wave.type === MobType.TNT) {
    await scene.timer.delay(TNT_COUNTDOWN_TIME)
    console.log('EXPLODE!!')
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
      console.log('COMPLETE!')
    }
  }

  const random = new ParkMiller(getRandomInt())
  const targetId = random.integerInRange(0, 3)

  // Move towards
  scene.timer.repeatEvery(5, (_time, delta) => {
    // targetPosition should be to the left or to the right of the target
    const targetPosition = scene.state.positions.get(targetId)!
    const _mobPosition = scene.state.positions.get(mobId)!

    const leftOfTarget = { ...targetPosition, x: targetPosition.x - 100 }
    const rightOfTarget = { ...targetPosition, x: targetPosition.x + 100 }

    const leftOfTargetDistance = getDistance(_mobPosition, leftOfTarget)
    const rightOfTargetDistance = getDistance(_mobPosition, rightOfTarget)

    const targetDistance = Math.min(leftOfTargetDistance, rightOfTargetDistance)

    if (targetDistance < 30) {
      scene.state.velocities.set(mobId, { x: 0, y: 0 })
      return
    }

    const direction = normalize(
      subtract(
        _mobPosition,
        leftOfTargetDistance < rightOfTargetDistance ? leftOfTarget : (
          rightOfTarget
        ),
      ),
    )
    // delta here seems to always be 1
    const velocity = scale(MAXIMUM_SPEED * delta, direction)
    scene.state.velocities.set(mobId, velocity)

    if (direction.x < 0) {
      if (con.scale.x > 0) {
        scene.state.facings.set(mobId, 'left')
        con.scale.x *= -1
      }
    }
    if (direction.x > 0) {
      if (con.scale.x < 0) {
        scene.state.facings.set(mobId, 'right')
        con.scale.x *= -1
      }
    }
  })
}

export function purgeMob(mobId: EntityId) {}
