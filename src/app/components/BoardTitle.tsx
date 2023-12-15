import { KitProps, Text, TextProps, icss_title, renderHTMLDOM, useKitProps } from '../../packages/pivkit'

export function BoardTitle(kitProps: KitProps<Omit<TextProps, 'children'> & { children?: string }>) {
  const { props } = useKitProps(kitProps, { name: 'BoardTitle' })
  return (
    <Text
      id={props.children}
      htmlProps={{ id: props.children }}
      render:self={(selfProps) => renderHTMLDOM('h2', selfProps)}
      shadowProps={props}
      icss={[icss_title, { marginBottom: '16px' }]}
    >
      {props.children}
    </Text>
  )
}
