import { createMemo } from 'solid-js'
import { Accessify, KitProps, Text, TextRawProps, icssTitle, renderHTMLDOM, useKitProps } from '@edsolater/pivkit'
import { shrinkFn } from '@edsolater/fnkit'

export function BoardTitle(kitProps: KitProps<Omit<TextRawProps, 'children'> & { children?: Accessify<string> }>) {
  const { props } = useKitProps(kitProps, { name: 'BoardTitle' })
  const id = createMemo(() => shrinkFn(props.children) ?? '')
  return (
    <Text
      id={id()}
      htmlProps={{ id: id() }}
      render:self={(selfProps) => renderHTMLDOM('h2', selfProps)}
      shadowProps={props}
      icss={[icssTitle, { marginBottom: '16px' }]}
    >
      {id()}
    </Text>
  )
}
