import { MayFn, isObject } from '@edsolater/fnkit'
import { runtimeObjectFromAccess } from '../../fnkit'
import { ValidController } from '../piv'

/** even input () => Controller / Controller, it will always return Controller without invoke
 * just a wrapper of {@link runtimeObjectFromAccess}
 */
export function createController<C extends ValidController>(creator: MayFn<C>): C {
  if (isObject(creator)) return creator as C
  return runtimeObjectFromAccess(creator) as C
}
