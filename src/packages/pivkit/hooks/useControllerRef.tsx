import { CRef } from '../../piv/types/piv'
import { ValidController } from '../../piv/types/tools'

export function useControllerRef(propsRef: CRef<any> | undefined, componentController: ValidController) {
  propsRef?.(componentController)
}
