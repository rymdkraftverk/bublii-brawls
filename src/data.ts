import { arrowKeys } from 'alchemy-engine'

import game from './scene/game'
import mainMenu from './scene/mainMenu'

export const scenes = {
  game,
  mainMenu,
}

export const keys = ['a', 'w', 's', 'd', ...arrowKeys, 'Space'] as const

type EntityId = number

type Position = {
  x: number
  y: number
}

type Type = 'snowPatch'

export const state = {
  gold: 10,
  settingsVisible: false,
  positions: {} as Record<EntityId, Position>,
  radii: {} as Record<EntityId, Position>,
  types: {} as Record<EntityId, Type>,
  typeToIds: {} as Record<Type, EntityId>,
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
export const getNextId = () => nextId++
