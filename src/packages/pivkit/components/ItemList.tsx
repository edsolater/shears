import { createEffect, createMemo, For, JSXElement } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../piv'
import { createRef } from '../hooks/createRef'
import { useElementSize } from '../hooks/useElementSize'
import { omit } from '@edsolater/fnkit'

export type ListProps<T> = {
  items?: Iterable<T> | undefined
  children(item: T, index: () => number): JSXElement
}

/**
 * if for layout , don't render important content in Box
 */
export function List<T>(rawProps: KitProps<ListProps<T>, { noNeedAccessifyChildren: true }>) {
  const props = useKitProps<ListProps<T>>(rawProps, { noNeedAccessifyChildren: true })
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)
  createEffect(() => console.log('props: ', props.children))

  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv ref={setRef} shadowProps={omit(props, ['children'])}>
      <For each={[...(props.items ?? [])]}>{(item, idx) => (console.log('item', item), props.children(item, idx))}</For>
    </Piv>
  )
}
