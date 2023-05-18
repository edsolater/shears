import { Accessor, JSX, createEffect, createSignal, useContext } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { ListContext } from './List'
import { omit } from '../../../piv/utils/omit'

export type ListItemProps = {
  // /** e.g. item's index in List  */
  // idx: number
  needRender?: boolean
  children: () => JSX.Element
}

export type ListItemController = {
  isIntersecting: Accessor<boolean>
}
/**
 * context acceptor for {@link List} \
 * only used in {@link List}
 */
export function ListItem(
  rawProps: KitProps<ListItemProps, { controller: ListItemController; noNeedAccessifyChildren: true }>
) {
  const { props, lazyLoadController } = useKitProps(rawProps, { noNeedAccessifyChildren: true })

  const [itemRef, setRef] = createRef<HTMLElement>()

  // isIntersecting with parent `<List>`
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

  return props.needRender ? (
    <Piv
      ref={setRef}
      shadowProps={omit(props, 'children')}
      icss={{ visibility: isIntersecting() ? 'visible' : 'hidden' }}
    >
      {props.children()}
    </Piv>
  ) : (
    <>{undefined}</>
  )
}
