import { KitProps, useKitProps, Piv, Box, Text } from '../../packages/pivkit'

export interface ExamplePanelProps {
  name?: string
}

export function ExamplePanel(rawProps: KitProps<ExamplePanelProps>) {
  const { props } = useKitProps(rawProps)
  return (
    <Piv shadowProps={props}>
      <Text icss={{ fontWeight: 'bold', fontSize: '52px' }}>{props.name}</Text>
      <Box icss={{ display: 'grid', gap: '4px' }}>{props.children}</Box>
    </Piv>
  )
}
