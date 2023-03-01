import { useElementSize } from '@edsolater/pivkit'
import { Accessor } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { KitProps, useKitProps } from '../../piv/createKit'
import { Piv } from '../../piv/Piv'
import { createRef } from '../hooks/createRef'

type ContainerProps = KitProps<{
  children?: (utils: { width: Accessor<number | undefined>; height: Accessor<number | undefined> }) => JSX.Element
}>

export function Container(props: ContainerProps) {
  const { icss } = useKitProps(props)
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  return (
    <Piv icss={icss?.()} ref={setRef}>
      {props.children?.({ width, height })}
    </Piv>
  )
}
