import { Piv, signalizeProps, useKitProps } from '@edsolater/piv'
import { Accessor, createEffect, For, JSX } from 'solid-js'
import { ApiJsonPairInfo } from 'test-raydium-sdk-v2'

export function PairsPanel(rawProps: { infos: ApiJsonPairInfo[] }) {
  const props = useKitProps(rawProps)
  const pivProps = props

  return (
    <Piv>
      <For each={props.infos()}>
        {(info) => {
          const { name, ammId } = signalizeProps(info)
          createEffect(() => console.log('ammId', ammId()))
          return (
            <Piv>
              {name()} {ammId()}
            </Piv>
          )
        }}
      </For>
    </Piv>
  )
}
