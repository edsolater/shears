import { hasProperty, WeakerMap } from '@edsolater/fnkit'
import { ValidController } from '../types/tools'
import { KitProps } from '../createKit'
import { createSignal } from 'solid-js'

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
      get(target, prop) {
        if (!controller) {
          controller = getController()
        }
        return controller![prop as keyof Controller]
      }
    }
  ) as Controller
}

const recordedControllers = new WeakerMap<string, ValidController>()

export function recordController<Controller extends ValidController>(id: string, proxyController: Controller) {
  recordedControllers.set(id, proxyController)
}

export function unregisterController(id?: string) {
  id && recordedControllers.delete(id)
}

/** hook */
export function useComponentController<Controller extends ValidController>(id: string) {
  const [controller, setController] = createSignal<Controller>()
  const recordController = recordedControllers.get(id) as Controller | undefined
  if (recordController) {
    setController(() => recordController)
  }
  return controller
}
