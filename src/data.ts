import { arrowKeys } from 'alchemy-engine'

import game from './scene/game'
import mainMenu from './scene/mainMenu'
import { Sprite } from 'pixi.js'

export const scenes = {
  game,
  mainMenu,
}

export const keys = ['a', 'w', 's', 'd', ...arrowKeys, 'Space'] as const

export type EntityId = number

type Position = {
  x: number
  y: number
}

type Velocity = {
  x: number
  y: number
}

export type Radian = number // expected to be between 0 and Math.PI * 2

type Radius = number

type Mass = number

export type SnowMass = 0 | 1 | 2 | 3 | 4 | 5

export type State = {
  settingsVisible: boolean
  positions: Map<EntityId, Position>
  radii: Map<EntityId, Radius>
  velocities: Map<EntityId, Velocity>
  masses: Map<EntityId, Mass>
  types: Map<EntityId, Type>
  typeToIds: {
    snowPatch: EntityId[]
    player: EntityId[]
    mob: EntityId[]
  }
  snowMasses: Map<EntityId, SnowMass>
  aims: Map<EntityId, Radian>
}

export const sprites: Map<EntityId, Sprite> = new Map()

export const state: State = {
  settingsVisible: false,
  positions: new Map(),
  radii: new Map(),
  velocities: new Map(),
  masses: new Map(),
  types: new Map(),
  typeToIds: {
    snowPatch: [],
    player: [],
    mob: [],
  },
  snowMasses: new Map(),
  aims: new Map(),
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
