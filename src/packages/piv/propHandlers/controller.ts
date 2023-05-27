import { AnyFn, hasProperty, isArray, isFunction, shrinkFn } from '@edsolater/fnkit'
import { KitProps } from '../createKit'
import { ValidController } from '../types/tools'
import { JSXElement } from 'solid-js'

export function loadPropsControllerRef<Controller extends ValidController>(
  props: Partial<KitProps<{ controllerRef?: (getController: Controller) => void }>>,
  providedController: Controller
) {
  if (hasProperty(props, 'controllerRef')) {
    props.controllerRef?.(providedController)
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

export function parsePivChildren<
  Controller extends ValidController,
  P extends unknown | ((controller: Controller) => unknown)
>(originalChildren: P, controller: Controller = {} as Controller): JSXElement {
  return isArray(originalChildren)
    ? originalChildren.map((i) => parsePivChildren(i, controller))
    : isNormalControllerChildren(originalChildren)
    ? originalChildren(controller)
    : originalChildren
}

/**
 * solid children is normal children, so must have a judger function to distingrish normal function and solidjs children function
 * @param node children
 * @returns
 */
function isNormalControllerChildren(node: unknown): node is AnyFn {
  return isFunction(node) && !node.name.includes('readSignal' /*  learn by window console.log */)
}
