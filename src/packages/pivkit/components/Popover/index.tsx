import { createContext, useContext } from 'solid-js'
import { KitProps, useKitProps } from '../../createKit'
import { AddProps, Fragnment } from '../../piv'
import { PopoverPluginOptions, generatePopoverPlugins } from './generatePopoverPlugins'
import { Box } from '../Boxes'

export * from './generatePopoverPlugins'

type PopoverProps = PopoverPluginOptions

const PopoverContext = createContext<Partial<ReturnType<typeof generatePopoverPlugins>>>({})

/** will render nothing */
export function Popover(kitProps: KitProps<PopoverProps>) {
  const { props } = useKitProps(kitProps, { name: 'Popover' })
  const { popoverButtonPlugin, popoverPanelPlugin, popoverWrapperPlugin } = generatePopoverPlugins({ placement: props.placement ?? 'top' })
  return (
    <PopoverContext.Provider value={{ popoverButtonPlugin, popoverPanelPlugin }}>
      <Box plugin={popoverWrapperPlugin}>{props.children}</Box>
    </PopoverContext.Provider>
  )
}

/** will render nothing */
function PopoverTrigger(kitProps: KitProps) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'PopoverTrigger' })
  const { popoverButtonPlugin } = useContext(PopoverContext)
  return (
    <AddProps shadowProps={shadowProps} plugin={popoverButtonPlugin}>
      {props.children}
    </AddProps>
  )
}

/** will render nothing */
function PopoverContent(kitProps: KitProps) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'PopoverContent' })
  const { popoverPanelPlugin } = useContext(PopoverContext)
  return (
    <AddProps shadowProps={shadowProps} plugin={popoverPanelPlugin}>
      {props.children}
    </AddProps>
  )
}

Popover.Trigger = PopoverTrigger
Popover.Content = PopoverContent
