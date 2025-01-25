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
import { getRandomInt } from 'tiny-toolkit'
import { getNextId, TextStyle, type EntityId } from '~/data'
import type { Scene, TextureName } from '~/type'
import { normalize, scale, subtract } from '~/util/vector2d'

const MAXIMUM_SPEED = 3

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

type Wave = { type: MobType }
const waves: Wave[] = [{ type: MobType.TNT }]

export default async function mobs(scene: Scene) {
  const wave = waves[0]

  if (!wave) {
    throw new Error('No wave data!!')
  }

  await startWave(scene, wave)
}

async function startWave(scene: Scene, wave: Wave) {
  await scene.timer.delay(30)
  const mobSprites = createObjectPool(30, () => {
    const con = container(scene.container)
    const character = animatedSprite(con)
    const weapon = sprite(con)
    const projectile = animatedSprite(con)
    return { con, character, weapon, projectile }
  })

  const mob1 = getNextId()
  scene.state.typeToIds.mob.push(mob1)

  const mobPosition = { x: scene.app.screen.width / 2, y: -20 }
  scene.state.positions.set(mob1, mobPosition)
  scene.state.radii.set(mob1, 50)

  const { con, character, weapon, projectile } = mobSprites.get()
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

  projectile.textures = projectileTextureMap[wave.type].map(
    (x) => scene.textures[x],
  )
  projectile.visible = false
  projectile.position = { x: 15, y: 8 }
  projectile.animationSpeed = 0.1
  projectile.play()
  projectile.anchor.y = 0.5

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
    const position = scene.state.positions.get(mob1)!
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
  const FLAMETHROWER_RADIUS = 15
  scene.state.radii.set(hazard, FLAMETHROWER_RADIUS)

  scene.timer.repeatEvery(1, () => {
    const mobFacing = scene.state.facings.get(mob1) ?? 'left'
    const mobPosition = scene.state.positions.get(mob1)!

    scene.state.positions.set(hazard, {
      y: mobPosition.y + 5,
      x: mobFacing === 'left' ? mobPosition.x - 60 : mobPosition.x + 60,
    })
  })

  projectile.visible = true

  speechBubble.destroy()

  const random = new ParkMiller(getRandomInt())
  const targetId = random.integerInRange(0, 3)

  // Move towards
  scene.timer.repeatEvery(5, () => {
    const targetPosition = scene.state.positions.get(targetId)!
    const _mobPosition = scene.state.positions.get(mob1)!

    const direction = normalize(subtract(_mobPosition, targetPosition))
    const velocity = scale(MAXIMUM_SPEED, direction)
    scene.state.velocities.set(mob1, velocity)

    if (direction.x < 0) {
      if (con.scale.x > 0) {
        scene.state.facings.set(mob1, 'left')
        con.scale.x *= -1
      }
    }
    if (direction.x > 0) {
      if (con.scale.x < 0) {
        scene.state.facings.set(mob1, 'right')
        con.scale.x *= -1
      }
    }
  })
}

export function purgeMob(mobId: EntityId) {}
