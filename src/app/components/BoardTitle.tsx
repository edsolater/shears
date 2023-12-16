import { createMemo } from 'solid-js'
import { Accessify, KitProps, Text, TextRawProps, icss_title, renderHTMLDOM, useKitProps } from '../../packages/pivkit'
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
      icss={[icss_title, { marginBottom: '16px' }]}
    >
      {id()}
    </Text>
  )
}
