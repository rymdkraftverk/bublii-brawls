#!/usr/bin/env node

// Run this to generate sprite sheet on Linux

import { chdir } from 'node:process'

import chalk from 'chalk'
import { execa } from 'execa'

// const UBUNTU_ASEPRITE_PATH =
//   '~/.steam/debian-installation/steamapps/common/Aseprite/aseprite'

const MAC_ASEPRITE_PATH = `$HOME/Library/Application\\ Support/Steam/steamapps/common/Aseprite/Aseprite.app/Contents/MacOS/aseprite`

export const SPRITESHEET_FOLDER_PATH = '/src/public/asset/spritesheet'

console.log()
console.log(chalk.blue('Generating sprite sheet...'))
console.log()
try {
  // Change directory so that "sprite" is not included in the texture name
  chdir('./sprite')
  const { stdout } = await execa(
    MAC_ASEPRITE_PATH,
    [
      '--batch',
      '*.{png,ase}',
      '**/*.{png,ase}',
      '--sheet',
      `..${SPRITESHEET_FOLDER_PATH}/sheet.png`,
      '--data',
      `..${SPRITESHEET_FOLDER_PATH}/data.json`,
      '--filename-format',
      "'{title}-{frame1}'",
      '--extrude',
      '--verbose',
    ],
    {
      shell: true,
    },
  )
  console.log('Aseprite output: ', stdout)

  await execa('prettier', [
    '--write',
    '../src/public/asset/spritesheet/data.json',
  ])
  console.log()
  console.log(chalk.green('Script executed successfully!'))
  console.log()
} catch (error) {
  console.error('Failed to generate sprite sheet: ', error)
}
