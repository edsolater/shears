import { Piv, useKitProps } from '@edsolater/piv'
import { createEffect, For } from 'solid-js'
import { ApiJsonPairInfo } from 'test-raydium-sdk-v2'

export function PairsPanel(rawProps: { infos: ApiJsonPairInfo[] }) {
  const props = useKitProps(rawProps)
  const pivProps = props
  return (
    <Piv>
      <For each={props.infos}>
        {({ name, ammId }) => {
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
