import { Piv, useKitProps } from '@edsolater/piv'
import { For } from 'solid-js'
import { ApiJsonPairInfo } from 'test-raydium-sdk-v2'

export function PairsPanel(rawProps: { infos: ApiJsonPairInfo[] }) {
  const props = useKitProps(rawProps)
  const pivProps = props

  return (
    <Piv>
      <For each={props.infos()}>{(info) => <Piv>{info.name}</Piv>}</For>
    </Piv>
  )
}
