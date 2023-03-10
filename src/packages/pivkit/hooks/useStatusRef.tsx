import { CRef } from '../../piv/types/piv'
import { ValidStatus } from '../../piv/types/tools'

export function useStatusRef(propsRef: CRef<any> | undefined, componentStatus: ValidStatus) {
  propsRef?.(componentStatus)
}
