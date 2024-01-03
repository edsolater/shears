import { MayFn, shrinkFn } from '@edsolater/fnkit'
import { Accessor, createEffect, createSignal } from 'solid-js'
import { addDefaultProps } from '../piv'

interface ToggleController {
  delayOn(options?: { forceDelayTime?: number }): void
  delayOff(options?: { forceDelayTime?: number }): void
  delayToggle(options?: { forceDelayTime?: number }): void
  delaySet(options?: { forceDelayTime?: number }): void
  cancelDelayAction(): void
  on(): void
  off(): void
  toggle(): void
  set(b: boolean): void
}

export type CreateToggleReturn = [Accessor<boolean>, ToggleController]

/** more piecer than createDisclosure */
export function createTogglableValue(
  initValue: MayFn<boolean> = false,
  options: {
    locked?: boolean
    /**only affact delay-* and canelDelayAction */
    delay?: number
    /* usually it is for debug */
    onOff?(): void
    /* usually it is for debug */
    onOn?(): void
    /* usually it is for debug */
    onToggle?(isOn: boolean): void
  } = {},
): CreateToggleReturn {
  const opts = addDefaultProps(options, { delay: 800 })
  const [isOn, _setIsOn] = createSignal(shrinkFn(initValue))

  createEffect(() => {
    const propsOn = shrinkFn(initValue)
    if (propsOn) {
      on()
    } else {
      off()
    }
  })

  const [delayActionId, setDelayActionId] = createSignal<number | NodeJS.Timeout>(0)
  const setIsOn = (...params: any[]) => {
    if (options.locked) return
    //@ts-expect-error temp
    _setIsOn(...params)
  }
  const cancelDelayAction = () => {
    globalThis.clearTimeout(delayActionId())
  }
  const on = () => {
    cancelDelayAction()
    setIsOn(true)
    opts.onOn?.()
  }
  const off = () => {
    cancelDelayAction()
    setIsOn(false)
    opts.onOff?.()
  }
  const toggle = () => {
    cancelDelayAction()
    setIsOn((b: any) => {
      if (b) opts.onOff?.()
      if (!b) opts.onOn?.()
      return !b
    })
    opts.onToggle?.(isOn())
  }

  const delayOn: ToggleController['delayOn'] = (options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(on, options?.forceDelayTime ?? opts.delay)
    setDelayActionId(actionId)
  }
  const delayOff: ToggleController['delayOff'] = (options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(off, options?.forceDelayTime ?? opts.delay)
    setDelayActionId(actionId)
  }
  const delayToggle: ToggleController['delayToggle'] = (options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(toggle, options?.forceDelayTime ?? opts.delay)
    setDelayActionId(actionId)
  }
  const delaySet: ToggleController['delaySet'] = (options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(setIsOn, options?.forceDelayTime ?? opts.delay)
    setDelayActionId(actionId)
  }
  const controller = {
    cancelDelayAction,
    delayOn,
    delayOff,
    delayToggle,
    delaySet,

    on,
    off,
    toggle,
    set: setIsOn,
  }
  return [isOn, controller]
}
