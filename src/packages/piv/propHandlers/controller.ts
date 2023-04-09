import { AnyFn, hasProperty, shrinkFn, WeakerMap } from '@edsolater/fnkit'
import { Subscribable } from '../../fnkit/customizedClasses/Subscribable'
import { KitProps } from '../createKit'
import { ValidController } from '../types/tools'

export function loadPropsControllerRef<Controller extends ValidController>(
  props: Partial<KitProps<{ controllerRef?: (getController: Controller) => void }>>,
  providedController: Controller
) {
  if (hasProperty(props, 'controllerRef')) {
    props.controllerRef!(providedController)
  }
}

/** for aviod access controller too early */
export function toProxifyController<Controller extends ValidController>(getController: () => Controller): Controller {
  let controller: Controller | undefined = undefined
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (!controller) {
          controller = getController()
        }
        return controller![prop as keyof Controller]
      }
    }
  ) as Controller
}

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

/** hook */
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

export function applyPivController<
  Controller extends ValidController,
  P extends unknown | ((controller: Controller) => unknown)
>(to: P, controller: Controller = {} as Controller): Exclude<P, AnyFn> {
  // @ts-expect-error no need to check
  return shrinkFn(to, [controller])
}
