import { AnyFn } from '@edsolater/fnkit'
import { objectMerge } from '../../fnkit/objectMerge'
import { ValidController } from '../types/tools'

export function parseOnClick(onClick: AnyFn, controller: ValidController) {
  return (ev: any) => onClick?.(objectMerge(controller, { ev, el: ev.currentTarget }))
}
