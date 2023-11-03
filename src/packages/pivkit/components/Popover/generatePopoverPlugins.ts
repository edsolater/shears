import { createEffect, onCleanup } from 'solid-js'
import { createRef } from '../..'
import { onEvent } from '../../domkit'
import { createTriggerController } from '../../hooks/utils/createTriggerController'
import { ICSS, PivProps, createPlugin } from '../../piv'
import { PopoverLocationHookOptions, usePopoverLocation } from '../../pluginComponents/popover/usePopoverLocation'

export type PopoverPluginOptions = Omit<PopoverLocationHookOptions, 'isTriggerOn' | 'buttonDom' | 'panelDom'>

/**
 *
 * @returns
 * - buttonPlugin(Piv): plugin for trigger
 * - popoverPlugin(Piv): plugin for popover
 * - info: accessors about trigger and popover
 */
export function generatePopoverPlugins(options?: PopoverPluginOptions) {
  const { trigger, isTriggerOn } = createTriggerController()

  const [buttonDom, setButtonDom] = createRef<HTMLElement>()
  const [panelDom, setPanelDom] = createRef<HTMLElement>()

  /**
   * in {@link popoverButtonPlugin}\
   * plugin registerer for trigger
   * @example
   * <Button plugin={buttonPlugin} />
   */
  const popoverButtonPlugin = createPlugin(
    () => () =>
      ({
        domRef: setButtonDom,
        onClick: ({ el }) => trigger.toggle(el),
      }) satisfies Partial<PivProps>,
  )

  const popoverWrapperPlugin = createPlugin(
    () => () =>
      ({
        icss: { position: 'relative', width: 'max-content', height: 'fit-content' },
      }) satisfies Partial<PivProps>,
  )

  /**
   * in {@link popoverButtonPlugin}\
   * plugin registerer for popover content
   * @example
   * <Box plugin={popoverTargetPlugin}>Popover Content</Box>
   */
  const popoverPanelPlugin = createPlugin(() => () => {
    // listen to popover toggle event and reflect to trigger state
    createEffect(() => {
      const el = panelDom()
      if (!el) return
      const { abort } = onEvent(el, 'toggle', ({ ev }) => {
        // @ts-expect-error force
        const { newState } = ev as { newState: 'open' | 'closed' }
        if (newState === 'open') {
          trigger.turnOn(el)
        } else {
          trigger.turnOff(el)
        }
      })
      onCleanup(abort)
    })
    const { panelStyle } = usePopoverLocation({
      buttonDom: buttonDom,
      panelDom: panelDom,
      isTriggerOn,
      ...options,
    })
    return {
      domRef: setPanelDom,
      get style() {
        return panelStyle()
      },
      get icss() {
        return { position: 'absolute' } as ICSS
      },
      // htmlProps: { popover: 'manual' } as any, //  lack of correct html type,
    } satisfies Partial<PivProps>
  })

  /**
   * in {@link popoverButtonPlugin}\
   *  public accessors
   */
  const pluginState = {
    buttonDom,
    panelDom,
    isTriggerOn,
  }

  return { state: pluginState, popoverButtonPlugin, popoverWrapperPlugin, popoverPanelPlugin }
}
