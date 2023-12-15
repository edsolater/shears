import { Text, TextKitProps, icss_title } from '../../packages/pivkit'

export function PageTitle(props: TextKitProps) {
  return (
    <Text shadowProps={props} icss={icss_title}>
      Pools
    </Text>
  )
}
