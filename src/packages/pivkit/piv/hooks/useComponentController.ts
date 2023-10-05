import { WeakerMap } from '@edsolater/fnkit'
import { Subscribable } from '../../../fnkit'
import { ValidController } from '../typeTools'
import { createEffect, onCleanup } from 'solid-js'

const recordedControllers = new Subscribable<WeakerMap<string, ValidController | unknown>>()

/**
 * only use it in {@link useKitProps}
 * @param proxyController provide controller
 * @param id id for {@link useControllerByID}
 */
export function registerControllerInCreateKit(
  proxyController: ValidController | unknown | undefined,
  id: string | undefined
) {
  if (!proxyController) return
  if (!id) return
  createEffect(() => {
    recordController(id, proxyController)
    onCleanup(() => {
      unregisterController(id)
    })
  })
}

export function recordController<Controller extends ValidController | unknown>(
  id: string,
  proxyController: Controller
) {
  recordedControllers.inject((m) => (m ?? new WeakerMap()).set(id, proxyController))
}

export function unregisterController(id?: string) {
  if (!id) return
  const records = recordedControllers.current
  if (!records) return
  recordedControllers.inject((recoder) => {
    recoder?.delete(id)
    return recoder
  })
}

/**
 * **Hook:** get target component's controller
 * @param componentID component id
 */
export function useControllerByID<Controller extends ValidController | unknown>(componentID: string) {
  let recordController: Controller | undefined = undefined
  const controller = new Proxy(
    {},
    {
      get(_target, prop) {
        if (!recordController) {
          throw new Error('controller not ready')
        }
        return Reflect.get(recordController, prop)
      },
    }
  )
  recordedControllers.subscribe((records) => {
    recordController = records?.get(componentID) as Controller | undefined
  })
  return controller as Controller
}
