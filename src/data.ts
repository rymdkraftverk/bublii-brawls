import { arrowKeys } from 'alchemy-engine'

import game from './scene/game'
import mainMenu from './scene/mainMenu'
import { Sprite } from 'pixi.js'
import * as V from '~/util/vector2d'

export const scenes = {
  game,
  mainMenu,
}

export const keys = ['a', 'w', 's', 'd', ...arrowKeys, 'Space'] as const

export type EntityId = number
export type PlayerId = EntityId
export type SnowBallId = EntityId

type Position = V.Vector2d

type Velocity = V.Vector2d

export type Radian = number // expected to be between 0 and Math.PI * 2

export type Radius = number

export type Mass = number

export type SnowMass = 0 | 1 | 2 | 3 | 4 | 5

export type Facing = 'left' | 'right'

export type State = {
  settingsVisible: boolean
  positions: Map<EntityId, Position>
  radii: Map<EntityId, Radius>
  velocities: Map<EntityId, Velocity>
  facings: Map<EntityId, Facing>
  masses: Map<EntityId, Mass>
  typeToIds: {
    snowPatch: EntityId[]
    player: EntityId[]
    mob: EntityId[]
    hazard: EntityId[]
    snowBall: EntityId[]
  }
  snowMasses: Map<EntityId, SnowMass>
  aims: Map<EntityId, Radian>
  snowBallLaunchers: Map<SnowBallId, PlayerId>
}

export function purge(state : State, id : EntityId) {
  const sprite = sprites.get(id)
  sprites.delete(id)

  if (sprite) {
    sprite.visible = false
  }

  state.positions.delete(id)
  state.radii.delete(id)
  state.velocities.delete(id)
  state.facings.delete(id)
  state.masses.delete(id)
  state.typeToIds.snowPatch = state.typeToIds.snowPatch.filter(x => x != id)
  state.typeToIds.player = state.typeToIds.player.filter(x => x != id)
  state.typeToIds.mob = state.typeToIds.mob.filter(x => x != id)
  state.typeToIds.hazard = state.typeToIds.hazard.filter(x => x != id)
  state.typeToIds.snowBall = state.typeToIds.snowBall.filter(x => x != id)
  state.snowMasses.delete(id)
  state.aims.delete(id)
}

export const sprites: Map<EntityId, Sprite> = new Map()

export const state: State = {
  settingsVisible: false,
  positions: new Map(),
  radii: new Map(),
  velocities: new Map(),
  facings: new Map<EntityId, Facing>(),
  masses: new Map(),
  typeToIds: {
    snowPatch: [],
    player: [],
    mob: [],
    hazard: [],
    snowBall: [],
  },
  snowMasses: new Map(),
  aims: new Map(),
  snowBallLaunchers: new Map(),
}

export type Type = keyof typeof state.typeToIds

export const TextStyle = {
  MAIN: {
    fontFamily: 'Press Start 2P',
    fill: 'white',
    fontSize: 12,
  },
} as const

// 4 because the first four are reserved for players
let nextId = 4
export const getNextId = (): EntityId => nextId++
