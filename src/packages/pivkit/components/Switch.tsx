import { Box } from '..'
import { KitProps, Piv, PivProps, useKitProps } from '../../piv'
import { createLazySignal } from '../hooks/createLazySignal'
import { createSyncSignal } from '../hooks/createSyncSignal'
import { Accessify } from '../utils/accessifyProps'

export interface SwitchController {}

export interface SwitchProps extends PivProps {
  isDefaultChecked?: Accessify<boolean, SwitchController>
}

export type DefaultSwitchProps = typeof defaultProps

const defaultProps = {
  isDefaultChecked: false
} satisfies Partial<SwitchProps>

/**
 * box for list
 * @deprecated , just use {@link List}
 */
export function Switch(rawProps: SwitchProps) {
  const { props, lazyLoadController } = useKitProps(rawProps, { defaultProps })
  const [isChecked, setIsChecked] = createSyncSignal({ get: () => props.isDefaultChecked })
  throw new Error('not implemented yet')
  return undefined
}

/**
 * created for form widget component
 */
function Label(rawProps: PivProps) {
  const { props } = useKitProps(rawProps)
  return <Piv class='Label' shadowProps={props} />
}
