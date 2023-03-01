import { Piv, signalize, useKitProps } from '@edsolater/piv'
import { createEffect, createMemo, For, Show } from 'solid-js'
import { ApiJsonPairInfo } from 'test-raydium-sdk-v2'

export function PairsPanel(rawProps: { infos: ApiJsonPairInfo[]; containerWidth?: number; containerHeight?: number }) {
  const props = useKitProps(rawProps)
  const pivProps = props
  const isHeightSmall = createMemo(() => (props.containerHeight?.() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (props.containerWidth?.() ?? Infinity) < 800)
  return (
    <Piv
      icss={{
        outline: '2px solid dodgerblue',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      <For each={props.infos()}>
        {(infos) => {
          const { name, ammId } = signalize(infos)
          return (
            <Piv
              icss={{
                display: 'grid',
                gridTemplateColumns: isWidthSmall() ? '120px' : '150px 500px',
                paddingBlock: 4,
                ':nth-child(2n)': { background: '#8080802e' }
              }}
            >
              <Piv>{name()}</Piv>
              <Show when={!isWidthSmall()}>
                <Piv>{ammId()}</Piv>
              </Show>
            </Piv>
          )
        }}
      </For>
    </Piv>
  )
}
