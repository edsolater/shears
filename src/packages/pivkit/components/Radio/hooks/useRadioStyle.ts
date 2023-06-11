import { DeKitProps } from '../../../../piv'
import { LabelProps } from '../../Label'
import { HTMLInputRadioProps } from '../HTMLInputRadio'
import { RadioProps } from '../Radio'

/**
 * hook for radio's **style**
 */
export function useRadioStyle(params: { props: DeKitProps<RadioProps> }) {
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
  } satisfies Partial<HTMLInputRadioProps>

  // FIXME: why not a createMemo is ok ?
  const radioThumbStyleProps = {
    icss: ({ isChecked }) => ({
      height: '100%',
      aspectRatio: '1',
      borderRadius: '999em',
      background: 'currentColor',
      // translate: params.isChecked() ? '100%' : '0',
      marginLeft: isChecked() ? 'auto' : '0',
      transition: '300ms',
    }),
  } satisfies Partial<RadioProps>

  return { wrapperLabelStyleProps, htmlCheckboxStyleProps, radioThumbStyleProps }
}
