import { PivChild, Piv } from '../../../../piv'
import { RadioController, RadioProps } from '..'

/**
 * can render radio Thumb
 * @todo it should be plugin
 */
export function renderRadioThumbPreset(
  renderContent: PivChild<RadioController> = ({ isChecked }) => (
    <Piv
      icss={{
        color: isChecked() ? 'dodgerblue' : 'crimson',
        width: '0.5em',
        height: '0.5em',
        backgroundColor: 'currentcolor',
        transition: '600ms',
        borderRadius: '999px',
      }}
    ></Piv>
  ),
): RadioProps['shadowProps'] {
  return {
    'anatomy:control': {
      'render:lastChild': renderContent,
    },
  }
}
