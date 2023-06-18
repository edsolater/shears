import { SwitchController, SwitchProps } from '..'
import { Piv, PivChild } from '../../../../piv'

/**
 * **Plugin** for Switch
 * can render switch Thumb
 * @todo it should be plugin
 */
export function renderSwitchThumb(
  renderThumbContent: PivChild<SwitchController> = ({ isChecked }) => (
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
): () => SwitchProps {
  return () => ({
    'anatomy:Thumb': {
      'render:lastChild': renderThumbContent,
    },
  })
}
