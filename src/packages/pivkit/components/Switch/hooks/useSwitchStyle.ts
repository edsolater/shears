import { DeKitProps } from '../../../../piv'
import { LabelProps } from '../../Label'
import { HTMLCheckboxProps } from '../HTMLCheckbox'
import { SwitchProps } from '../Switch'

/**
 * hook for switch's **style**
 */
export function useSwitchStyle(params: { props: DeKitProps<SwitchProps> }) {
  const wrapperLabelStyleProps = {
    icss: { width: '4em', height: '2em', background: '#cbd5e0', borderRadius: '999em', padding: 4 },
  } satisfies Partial<LabelProps>

  const htmlCheckboxStyleProps = {
    icss: {
      position: 'absolute',
      border: '0px',
      outline: 'none',
      opacity: 0,
      width: '1px',
      height: '1px',
      margin: '-1px',
      overflow: 'hidden',
    },
  } satisfies Partial<HTMLCheckboxProps>

  // FIXME: why not a createMemo is ok ?
  const switchThumbStyleProps = {
    icss: ({ isChecked }) => ({
      height: '100%',
      aspectRatio: '1',
      borderRadius: '999em',
      background: 'currentColor',
      // translate: params.isChecked() ? '100%' : '0',
      marginLeft: isChecked() ? 'auto' : '0',
      transition: '300ms',
    }),
  } satisfies Partial<SwitchProps>

  return { wrapperLabelStyleProps, htmlCheckboxStyleProps, switchThumbStyleProps }
}
