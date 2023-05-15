import { AnyFn, hasProperty, shrinkFn } from '@edsolater/fnkit'
import { KitProps } from '../createKit'
import { ValidController } from '../types/tools'

export function loadPropsControllerRef<Controller extends ValidController>(
  props: Partial<KitProps<{ controllerRef?: (getController: Controller) => void }>>,
  providedController: Controller
) {
  if (hasProperty(props, 'controllerRef')) {
    // @ts-expect-error no need to check
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

export function applyPivController<
  Controller extends ValidController,
  P extends unknown | ((controller: Controller) => unknown)
>(to: P, controller: Controller = {} as Controller): Exclude<P, AnyFn> {
  // @ts-expect-error no need to check
  return shrinkFn(to, [controller])
}
