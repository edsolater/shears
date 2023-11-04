import { createSignal } from 'solid-js'
import { UUID, createUUID } from './createUUID'
import { AnyFn, createEventCenter } from '@edsolater/fnkit'

// global cache
const triggerControllers = new Map<UUID, TriggerController>()

type TriggerController = {
  open(selfElement: HTMLElement): void
  close(selfElement: HTMLElement): void
  toggle(selfElement: HTMLElement): void
  callbackRegisterer: {
    onTriggerOn(cb: (info: { triggerElement: HTMLElement }) => void): {
      cleanup(): void
    }
    onTriggerOff(cb: (info: { triggerElement: HTMLElement }) => void): {
      cleanup(): void
    }
    onToggle(cb: (info: { triggerElement: HTMLElement }) => void): {
      cleanup(): void
    }
  }
  isTriggerOn: () => boolean
}

/**
 * not a solid hook
 *
 * use for Modal / Popover / Drawer like trigger component
 * @param id force id; if not provided, will create a new one
 */
export function createTrigger({
  id = createUUID().id,
  defaultState = false,
}: {
  id?: UUID
  defaultState?: boolean
} = {}): TriggerController {
  if (triggerControllers.has(id)) return triggerControllers.get(id)!
  const [isTriggerOn, setIsTriggerOn] = createSignal(defaultState)
  const callbackOnStack = [] as AnyFn[]
  const callbackOffStack = [] as AnyFn[]
  const callbackToggleStack = [] as AnyFn[]

  //TODO: createEventCenter is weird, right?
  const eventCenter = createEventCenter<{
    on(el: HTMLElement): void
    off(el: HTMLElement): void
    toggle(el: HTMLElement): void
  }>()
  eventCenter.registEvents({
    'on': (el: HTMLElement) => {
      setIsTriggerOn(true)
      callbackOnStack.forEach((cb) => cb({ triggerElement: el }))
    },
    'off': (el: HTMLElement) => {
      setIsTriggerOn(false)
      callbackOffStack.forEach((cb) => cb({ triggerElement: el }))
    },
    'toggle': (el: HTMLElement) => {
      setIsTriggerOn((b) => !b)
      callbackToggleStack.forEach((cb) => cb({ triggerElement: el }))
    },
  })

  function turnTriggerOn(from: HTMLElement) {
    eventCenter.emit('on', [from])
  }
  function turnTriggerOff(from: HTMLElement) {
    eventCenter.emit('off', [from])
  }
  function toggleTrigger(from: HTMLElement) {
    eventCenter.emit('toggle', [from])
  }

  const callbackRegisterer = {
    onTriggerOn(cb: AnyFn) {
      callbackOnStack.push(cb)
      return {
        cleanup() {
          callbackOnStack.splice(callbackOnStack.indexOf(cb), 1)
        },
      }
    },
    onTriggerOff(cb: AnyFn) {
      callbackOffStack.push(cb)
      return {
        cleanup() {
          callbackOffStack.splice(callbackOffStack.indexOf(cb), 1)
        },
      }
    },
    onToggle(cb: AnyFn) {
      callbackToggleStack.push(cb)
      return {
        cleanup() {
          callbackToggleStack.splice(callbackToggleStack.indexOf(cb), 1)
        },
      }
    },
  } as TriggerController['callbackRegisterer']

  return { isTriggerOn, callbackRegisterer, close:turnTriggerOff, open:turnTriggerOn, toggle:toggleTrigger }
}
