import { CRef } from '@edsolater/piv'
import { ValidStatus } from '@edsolater/piv'

export function useStatusRef(propsRef: CRef<any> | undefined, componentStatus: ValidStatus) {
  propsRef?.(componentStatus)
}
