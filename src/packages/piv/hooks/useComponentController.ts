import { WeakerMap } from '@edsolater/fnkit'
import { Subscribable } from '../../fnkit/customizedClasses/Subscribable'
import { ValidController } from '../types/tools'

const recordedControllers = new Subscribable<WeakerMap<string, ValidController>>()

export function recordController<Controller extends ValidController>(id: string, proxyController: Controller) {
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
 * @param id component id
 */
export function useComponentController<Controller extends ValidController>(id: string) {
  let recordController: Controller | undefined = undefined
  const controller = new Proxy(
    {},
    {
      get(_target, prop) {
        if (!recordController) {
          throw new Error('controller not ready')
        }
        return Reflect.get(recordController, prop)
      }
    }
  )
  recordedControllers.subscribe((records) => {
    recordController = records?.get(id) as Controller | undefined
  })
  return controller as Controller
}
