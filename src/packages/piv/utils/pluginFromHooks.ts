import { AnyObj } from '@edsolater/fnkit'
import { createPlugin } from '../propHandlers/plugin'
import { PivProps } from '../types/piv'

export function wrapToPlugin<P extends PivProps<'div'>, R extends AnyObj>(hook: (props: P) => R) {
  return createPlugin((props) => {
    const hookReturn = hook(props)
    return hookReturn
  }, { name: `[hook]${hook.name}` })
}
