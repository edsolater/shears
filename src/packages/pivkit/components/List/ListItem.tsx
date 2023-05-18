import { Accessor, JSX, Show, createEffect, createMemo, createSignal, useContext } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { ListContext } from './List'
import { omit } from '../../../piv/utils/omit'

export type ListItemProps = {
  // /** e.g. item's index in List  */
  idx: number
  canRender?: boolean
  children: () => JSX.Element
}

export type ListItemController = {
  isIntersecting: Accessor<boolean>
}
/**
 * context acceptor for `<List>` \
 * only used in `<List>`
 */
export function ListItem(
  rawProps: KitProps<ListItemProps, { controller: ListItemController; noNeedAccessifyChildren: true }>
) {
  const { props, lazyLoadController } = useKitProps(rawProps, { noNeedAccessifyChildren: true })

  const [itemRef, setRef] = createRef<HTMLElement>()

  // isIntersecting with parent `<List>`'s intersectionObserver
  const listContext = useContext(ListContext)
  const [isIntersecting, setIsIntersecting] = createSignal(false)
  createEffect(() => {
    const el = itemRef()
    if (!el) return
    listContext.observeFunction?.(el, ({ entry }) => {
      setIsIntersecting(entry.isIntersecting)
    })
  })

  const controller: ListItemController = {
    isIntersecting
  }
  lazyLoadController(controller)
  const childContent = createMemo(() => (props.canRender ? props.children() : undefined))
  return (
    <Show when={props.canRender}>
      <Piv
        ref={setRef}
        shadowProps={omit(props, 'children')}
        icss={{ visibility: isIntersecting() ? 'visible' : 'hidden' }}
      >
        {childContent}
      </Piv>
    </Show>
  )
}
