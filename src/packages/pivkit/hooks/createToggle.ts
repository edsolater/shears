import { MayFn, shrinkFn } from '@edsolater/fnkit'
import { Accessor, createEffect, createSignal } from 'solid-js'
import { addDefaultProps } from '../piv'

interface DisclosureController {
  on(options?: { delay?: number }): void
  off(options?: { delay?: number }): void
  toggle(options?: { delay?: number }): void
  set(b: boolean, options?: { delay?: number }): void
  cancelDelayAction(): void
}

export type CreateDisclosureReturn = [Accessor<boolean>, DisclosureController]

/** more piecer than createDisclosure */
export function createDisclosure(
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
): CreateDisclosureReturn {
  const defaultOptions = { delay: 800 }
  const opts = addDefaultProps(options, defaultOptions)
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

  const delayOn: DisclosureController['on'] = (options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(on, options?.delay ?? opts.delay)
    setDelayActionId(actionId)
  }
  const delayOff: DisclosureController['off'] = (options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(off, options?.delay ?? opts.delay)
    setDelayActionId(actionId)
  }
  const delayToggle: DisclosureController['toggle'] = (options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(toggle, options?.delay ?? opts.delay)
    setDelayActionId(actionId)
  }
  const delaySet: DisclosureController['set'] = (v, options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(() => setIsOn(v), options?.delay ?? opts.delay)
    setDelayActionId(actionId)
  }
  const controller = {
    cancelDelayAction,
    on: delayOn,
    off: delayOff,
    toggle: delayToggle,
    set: delaySet,
  }
  return [isOn, controller]
}
