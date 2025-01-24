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

export const state = {
  gold: 10,
  settingsVisible: false,
  positions: new Map() as Map<EntityId, Position>,
  radii: {} as Record<EntityId, Radius>,
  velocities: new Map() as Map<EntityId, Velocity>,
  masses: new Map() as Map<EntityId, Mass>,
  types: {} as Record<EntityId, Type>,
  typeToIds: {
    snowPatch: [] as EntityId[],
    player: [] as EntityId[],
  },
  sprites: {} as Record<EntityId, Sprite>,
  snowMasses: {} as Record<EntityId, SnowMass>,
}
export type State = typeof state

export const TextStyle = {
  MAIN: {
    fontFamily: 'Press Start 2P',
    fill: 'white',
    fontSize: 12,
  },
} as const

let nextId = 1
export const getNextId = (): EntityId => nextId++
