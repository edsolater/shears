import { createContext, useContext } from 'solid-js'
import { KitProps, useKitProps } from '../../createKit'
import { PropContext, mergeProps } from '../../piv'
import { PopoverPluginOptions, generatePopoverPlugins } from './generatePopoverPlugins'

export * from './generatePopoverPlugins'

type PopoverProps = PopoverPluginOptions

const PopoverContext = createContext<Partial<ReturnType<typeof generatePopoverPlugins>>>({})

/** will render nothing */
export function Popover(kitProps: KitProps<PopoverProps>) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'Popover' })
  const { popoverButtonPlugin, popoverPanelPlugin } = generatePopoverPlugins({ placement: props.placement ?? 'top' })
  return (
    <PopoverContext.Provider value={{ popoverButtonPlugin, popoverPanelPlugin }}>
      <PropContext additionalProps={shadowProps}>{props.children}</PropContext>
    </PopoverContext.Provider>
  )
}
Popover.Trigger = PopoverTrigger
Popover.Content = PopoverContent

/** will render nothing */
function PopoverTrigger(kitProps: KitProps) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'PopoverTrigger' })
  const { popoverButtonPlugin } = useContext(PopoverContext)
  return (
    <PropContext additionalProps={mergeProps(shadowProps, { plugin: popoverButtonPlugin })}>
      {props.children}
    </PropContext>
  )
}

/** will render nothing */
function PopoverContent(kitProps: KitProps) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'PopoverContent' })
  const { popoverPanelPlugin } = useContext(PopoverContext)
  return (
    <PropContext additionalProps={mergeProps(shadowProps, { plugin: popoverPanelPlugin })}>
      {props.children}
    </PropContext>
  )
}
