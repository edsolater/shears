import { createContext } from 'solid-js'
import { Piv } from '../../piv'
import { KitProps, useKitProps } from '../../piv/createKit'
import { createContextStore } from '../hooks/createContextStore'
import { createToggle } from '../hooks/createToggle'

// type CollapseProps = KitProps<
//   {
//     open?: boolean
//     defaultOpen?: boolean
//     collapseDirection?: 'down' | 'up'
//     onOpen?(): void
//     onClose?(): void
//     onToggle?(): void
//   },
//   { htmlPropsTagName: 'details' }
// >

// const [] = createContext()

// export function Collapse(rawProps: CollapseProps) {
//   const props = useKitProps(rawProps)

//   const [innerOpen, { toggle, on, off, set }] = createToggle(props.open ?? props.defaultOpen ?? false, {
//     onOff: props.onClose,
//     onOn: props.onOpen,
//     onToggle: props.onToggle
//   })
//   const status = {
//     get isOpen() {
//       return innerOpen()
//     },
//     open: on,
//     close: off,
//     toggle
//   }
//   const [collapseContext] = createContextStore(status)
//   return <Piv<'details'> {...props} />
// }
