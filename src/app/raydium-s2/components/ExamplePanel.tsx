import { createEffect, splitProps } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../packages/piv'
import { Box, Text } from '../../../packages/pivkit'
import { omit } from '../../../packages/piv/utils/omit'

export type ExamplePanelProps = {
  name?: string
}

export function ExamplePanel(rawProps: KitProps<ExamplePanelProps>) {
  const props = useKitProps<ExamplePanelProps>(rawProps)
  return (
    <Piv shadowProps={omit(props, ['children']) /*  fix me */}>
      <Text icss={{ fontWeight: 'bold', fontSize: '52px' }}>{props.name}</Text>
      <Box icss={{ display: 'grid', gap: 4 }}>{props.children}</Box>
    </Piv>
  )
}
