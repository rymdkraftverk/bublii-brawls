// let gamepads: Record<number, Gamepad> = {}

// window.addEventListener('gamepadconnected', (e) => {
//   console.log('Gamepad connected', e.gamepad)
//   // gamepads[e.gamepad.index] = e.gamepad
// })
// window.addEventListener('gamepaddisconnected', (e) => {
//   console.log('Gamepad disconnected', e.gamepad)
// })

type Axes = {
  horizontal: number
  vertical: number
}

type Trigger = number

type Buttons = {
  [index: number]: boolean
}

export type AlchemyGamepad = {
  index: number
  id: string
  axes: Axes
  axesRight: Axes
  buttons: Buttons
  leftTrigger: Trigger
  rightTrigger: Trigger
}

type ReturnValue = [
  AlchemyGamepad | null,
  AlchemyGamepad | null,
  AlchemyGamepad | null,
  AlchemyGamepad | null,
]

export function getGamepads(): ReturnValue {
  const gamepads = navigator.getGamepads() as [
    Gamepad | null,
    Gamepad | null,
    Gamepad | null,
    Gamepad | null,
  ]

  const returnValue = gamepads.map((g) => {
    if (!g) {
      return g
    }

    let buttons: Buttons = {}
    for (const [index, button] of g.buttons.entries()) {
      if (button.pressed || button.touched || button.value === 1) {
        buttons[index] = true
      } else {
        buttons[index] = false
      }
    }
    let axes: Axes = { horizontal: 0, vertical: 0 }
    axes.horizontal = g.axes[0] ?? 0
    axes.vertical = g.axes[1] ?? 0

    let axesRight: Axes = { horizontal: 0, vertical: 0 }
    axesRight.horizontal = g.axes[2] ?? 0
    axesRight.vertical = g.axes[3] ?? 0

    let leftTrigger: Trigger = g.axes[4] ?? (g.buttons[6] ? 1 : 0) ?? 0
    let rightTrigger: Trigger = g.axes[5] ?? (g.buttons[7] ? 1 : 0) ?? 0

    return {
      axes,
      axesRight,
      leftTrigger,
      rightTrigger,
      buttons,
      index: g.index,
      id: g.id,
    }
  }) as ReturnValue

  return returnValue
}
