import { CRef } from '../../piv'
import { ValidController } from '../../piv'

export function useControllerRef(propsRef: CRef<any> | undefined, componentController: ValidController) {
  propsRef?.(componentController)
}
