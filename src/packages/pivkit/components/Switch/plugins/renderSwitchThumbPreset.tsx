import { PivChild, Piv } from '../../../../piv'
import { SwitchController, SwitchProps } from '..'

/**
 * can render switch Thumb
 * @todo it should be plugin
 */
export function renderSwitchThumbPreset(
  renderContent: PivChild<SwitchController> = ({ isChecked }) => (
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
): SwitchProps['shadowProps'] {
  return {
    'anatomy:SwitchThumb': {
      'render:lastChild': renderContent,
    },
  }
}
