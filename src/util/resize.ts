import type { Scene } from '~/type'

let ratio = 2

/**
 * Resize the stage and maintain good text quality
 */
export const resize = (scene: Scene, width: number, height: number): void => {
  const gameWidth = scene.app.renderer.width
  const gameHeight = scene.app.renderer.height

  ratio = Math.min(width / gameWidth / 2, height / gameHeight / 2)

  scene.app.stage.scale.set(ratio)

  scene.app.renderer.resize(gameWidth * ratio, gameHeight * ratio)
}

// * Make game fullscreen and resize when window is resized
export const useAutoFullScreen = (
  scene: Scene,
  onChange?: () => void,
): void => {
  const resizeGame = () => {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    resize(scene, screenWidth, screenHeight)
    if (onChange) {
      onChange()
    }
  }

  window.addEventListener('resize', resizeGame)
  resizeGame()
}
