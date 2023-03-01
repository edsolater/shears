import { Piv, useKitProps } from '@edsolater/piv'
import { createEffect, For } from 'solid-js'
import { ApiJsonPairInfo } from 'test-raydium-sdk-v2'

export function PairsPanel(rawProps: { infos: ApiJsonPairInfo[] }) {
  const props = useKitProps(rawProps)
  const pivProps = props
  return (
    <Piv
      icss={{
        border: '2px solid dodgerblue',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: 'fit-content',
        resize: 'both',
        overflow: 'hidden'
      }}
    >
      <For each={props.infos}>
        {({ name, ammId }) => (
          <Piv
            icss={{
              display: 'grid',
              gridTemplateColumns: '150px 500px',
              paddingBlock: 4,
              ':nth-child(2n)': { background: '#8080802e' }
            }}
          >
            <Piv>{name()}</Piv>
            <Piv>{ammId()}</Piv>
          </Piv>
        )}
      </For>
    </Piv>
  )
}
