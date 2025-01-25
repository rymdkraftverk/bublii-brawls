import {
  animatedSprite,
  container,
  createObjectPool,
  graphics,
  sprite,
  text,
} from 'alchemy-engine'
import ParkMiller from 'park-miller'
import { getNextId, TextStyle } from '~/data'
import type { Scene } from '~/type'
import { normalize, scale, subtract } from '~/util/vector2d'

const MAXIMUM_SPEED = 4

export default async function mobs(scene: Scene) {
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

  // TODO: Map
  const { con, character, weapon, projectile } = mobSprites.get()
  character.textures = [
    scene.textures['lizard_green_0-1'],
    scene.textures['lizard_green_0-2'],
  ]
  character.animationSpeed = 0.05
  character.play()
  character.scale = 0.5
  character.anchor = 0.5

  weapon.texture = scene.textures['flamethrower_0-1']
  weapon.position = { x: -13, y: -15 }
  weapon.scale = 0.5

  projectile.textures = [
    scene.textures['flamethrower_flame_0-1'],
    scene.textures['flamethrower_flame_0-2'],
    scene.textures['flamethrower_flame_0-3'],
  ]
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

  await scene.timer.delay(100)

  projectile.visible = true

  speechBubble.destroy()

  const random = new ParkMiller(999)
  // Is max here inclusive?
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
        con.scale.x *= -1
      }
    }
    if (direction.x > 0) {
      if (con.scale.x < 0) {
        con.scale.x *= -1
      }
    }
  })
}
