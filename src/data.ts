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

type Radius = number

type Mass = number

type Type = 'snowPatch' | 'player'

export type SnowMass = 0 | 1 | 2 | 3 | 4 | 5

export type State = {
  gold: number
  settingsVisible: boolean
  positions: Map<EntityId, Position>
  radii: Record<EntityId, Radius>
  velocities: Map<EntityId, Velocity>
  masses: Map<EntityId, Mass>
  types: Record<EntityId, Type>
  typeToIds: {
    snowPatch: EntityId[]
    player: EntityId[]
  }
  sprites: Record<EntityId, Sprite>
  snowMasses: Record<EntityId, SnowMass>
}

export const state: State = {
  gold: 10,
  settingsVisible: false,
  positions: new Map(),
  radii: {},
  velocities: new Map(),
  masses: new Map(),
  types: {},
  typeToIds: {
    snowPatch: [],
    player: [],
  },
  sprites: {},
  snowMasses: {},
}

export const TextStyle = {
  MAIN: {
    fontFamily: 'Press Start 2P',
    fill: 'white',
    fontSize: 12,
  },
} as const

let nextId = 1
export const getNextId = (): EntityId => nextId++
