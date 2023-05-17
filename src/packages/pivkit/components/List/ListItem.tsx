import { Accessor, createEffect, createSignal, useContext } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { ListContextType, ListContext } from './List'

export type ListItemProps = {}
export type ListItemController = {
  isIntersecting: Accessor<boolean>
}
/**
 * context acceptor for {@link List} \
 * wrap {@link ListItem}'s content to use
 */
export function ListItem(rawProps: KitProps<ListItemProps, { controller: ListItemController }>) {
  const { props, lazyLoadController } = useKitProps(rawProps)

  const listContext = useContext(ListContext)
  const [itemRef, setRef] = createRef<HTMLElement>()
  const [isIntersecting, setIsIntersecting] = createSignal(false)

  const controller: ListItemController = {
    isIntersecting
  }
  lazyLoadController(controller)

  createEffect(() => {
    const el = itemRef()
    if (!el) return
    listContext.observeFunction?.(el, ({ entry }) => {
      setIsIntersecting(entry.isIntersecting)
    })
  })

  return (
    <Piv ref={setRef} shadowProps={props} icss={{ visibility: isIntersecting() ? 'visible' : 'hidden' }}>
      {props.children}
    </Piv>
  )
}
