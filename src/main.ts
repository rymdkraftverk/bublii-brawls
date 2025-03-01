import { Application } from 'pixi.js'
import createGame from 'alchemy-engine'

import { keys, scenes, state } from './data.js'

// TODO: Add to template
import sounds from './sounds.json' with { type: 'json' }

const GAME_WIDTH = 640
const GAME_HEIGHT = 480

const WINDOW_WIDTH = window.innerWidth
const WINDOW_HEIGHT = window.innerHeight

const resolution = Math.min(
  WINDOW_WIDTH / GAME_WIDTH,
  WINDOW_HEIGHT / GAME_HEIGHT,
)

async function main() {
  const app = new Application()

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    resolution,
    antialias: true,
  })

  const spriteSheetPath = './asset/spritesheet/data.json'
  const font = '10pt "Press Start 2P"'

  createGame({
    app,
    state,
    scene: 'game',
    scenes,
    keys,
    sounds,
    spriteSheetPath,
    font,
    config: {
      pixelPerfect: true,
    },
    panel: [
      {
        type: 'string',
        label: 'test',
        getValue: () => {
          return '42'
        },
      },
    ],
  })
}

main()
