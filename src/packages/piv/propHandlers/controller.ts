import { hasProperty, WeakerMap } from '@edsolater/fnkit'
import { ValidController } from '../types/tools'
import { KitProps } from '../createKit'
import { createSignal } from 'solid-js'
import { Subscribable } from '../../fnkit/customizedClasses/Subscribable'

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
  //TODO: proxy object, not signal
  const [controller, setController] = createSignal<Controller>()
  recordedControllers.subscribe((records) => {
    const recordController = records?.get(id) as Controller | undefined
    setController(() => recordController)
  })
  return controller
}

