import { Container } from 'pixi.js'
import { text, onClick, onHover } from 'alchemy-engine'

// TODO: Add to template
import packageJson from '~/../package.json' with { type: 'json' }
import { TextStyle } from '~/data.js'
import settings from '../ui/settings.js'
import { type Scene } from '~/type.js'

export default async function mainMenu({
  container,
  state,
  setScene,
  app,
  animate,
}: Scene) {
  const titleText = text(
    container,
    { ...TextStyle.MAIN, fontSize: 50 },
    packageJson.name,
  )
  titleText.label = 'titleText'
  titleText.anchor.set(0.5)
  titleText.x = app.screen.width / 2
  titleText.y = app.screen.height / 3

  animate.sine({
    onUpdate: (value) => {
      titleText.angle = value
    },
    startValue: titleText.angle - 7,
    endValue: titleText.angle + 7,
    duration: 280,
  })

  const startGameButton = text(
    container,
    { ...TextStyle.MAIN, fontSize: 20 },
    'Start game',
  )
  startGameButton.label = 'startGameButton'
  startGameButton.anchor.set(0.5)
  startGameButton.position.y = app.screen.height - 140
  startGameButton.position.x = app.screen.width / 2

  onClick(startGameButton, () => {
    setScene('game')
  })

  // TODO: onHoverAnimation which includes cancel behavior built-in?
  let cancel: (() => void) | undefined
  const hoverAnimation = (container: Container) => ({
    onOver: () => {
      const startValue = 1
      const promise = animate.easeOut({
        onUpdate: (value) => {
          container.scale.set(value)
        },
        startValue,
        endValue: startValue + 0.18,
        duration: 15,
      })

      cancel = promise.cancel
    },
    onOut: () => {
      if (cancel) {
        cancel()
      }
      container.scale.set(1)
    },
  })

  onHover(startGameButton, hoverAnimation(startGameButton))

  const settingsButton = text(
    container,
    { ...TextStyle.MAIN, fontSize: 20 },
    'Settings',
  )
  settingsButton.label = 'settingsButton'
  settingsButton.anchor.set(0.5)
  settingsButton.position.y = app.screen.height - 100
  settingsButton.position.x = app.screen.width / 2

  onHover(settingsButton, hoverAnimation(settingsButton))

  onClick(settingsButton, () => {
    state.settingsVisible = true
  })

  settings(app, container, state)
}
