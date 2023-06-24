import { Accessor, createSignal } from 'solid-js'
import { Piv } from '../../../../piv/Piv'
import { KitProps, useKitProps } from '../../../../piv/createKit'
import { ValidController } from '../../../../piv/types'
import { createSyncSignal } from '../../../hooks'
import { Label } from '../../Label'
import { LabelBox } from '../../LabelBox'
import { Box } from '../../Box'
import { icss_col, icss_row } from '../../../icssBlocks'

export interface RadioGroupController {
  name: string
  current: () => string | undefined

  check: (option: string) => void
  uncheck: () => void
}

export type RadioGroupProps<Controller extends ValidController = RadioGroupController> = KitProps<
  {
    name: string
    option?: string
    defaultOption?: string
    onChange?(utils: { option: string; isChecked: boolean }): void
    // 'anatomy:ContainerBox'?: LabelBoxProps
    // 'anatomy:HTMLRadioGroup'?: HTMLInputRadioGroupProps
    // 'anatomy:Checkbox'?: PivProps<'div', Controller>
    // 'anatomy:Option'?: LabelProps
  },
  { controller: Controller }
>

const selfProps = ['name', 'option', 'defaultOption', 'onChange'] satisfies (keyof RadioGroupProps)[]

const defaultProps = {
  name: 'unknown radio group',
} satisfies Partial<RadioGroupProps>

/**
 * RadioGroup can illustrate a boolean value
 */
export function RadioGroup(rawProps: RadioGroupProps) {
  const { props, shadowProps, lazyLoadController } = useKitProps(rawProps, {
    defaultProps,
    selfProps: selfProps,
  })

  const [selectedOption, setSeletedOption] = createSignal(props.option)

  const radioGroupController = {
    get option() {
      return props.option
    },
  }

  lazyLoadController(radioGroupController)

  return <Box class='RadioGroup' shadowProps={shadowProps} icss={icss_col()}></Box>
}
