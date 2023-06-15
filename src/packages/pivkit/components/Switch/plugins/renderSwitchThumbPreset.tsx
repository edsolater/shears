import { PivChild, Piv } from '../../../../piv'
import { SwitchController, SwitchProps } from '..'
import { createEffect, createSignal } from 'solid-js'

/**
 * **Plugin** for Switch
 * can render switch Thumb
 * @todo it should be plugin
 */
export function renderSwitchThumb(
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
  const [count, setCount] = createSignal(0)
  createEffect(() => {
    console.log('count: ', count())
  })

  return {
    'anatomy:SwitchThumb': {
      'render:lastChild': renderContent,
    },
  }
}
