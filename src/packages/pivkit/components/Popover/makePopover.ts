import { createEffect, onCleanup } from 'solid-js'
import { createRef } from '../..'
import { onEvent } from '../../domkit'
import { createTrigger } from '../../hooks/utils/createTrigger'
import { ICSS, PivProps, createPlugin } from '../../piv'
import { PopoverLocationHookOptions, usePopoverLocation } from '../../pluginComponents/popover/usePopoverLocation'
import { useGestureHover } from '../../domkit/hooks/useGestureHover'

export type PopoverPluginOptions = Omit<PopoverLocationHookOptions, 'isTriggerOn' | 'buttonDom' | 'panelDom'> & {
  /** @default 'hover' */
  triggerBy?: 'hover' | 'click'
}

/**
 * **headless Hooks**
 * only logic not style
 * when hooks startWith 'make', it means u can use this hook to make a composition of component by plugins
 * @returns
 * - buttonPlugin(Piv): plugin for trigger
 * - popoverPlugin(Piv): plugin for popover
 * - info: accessors about trigger and popover
 */
export function makePopover(options?: PopoverPluginOptions) {
  const { close, open, toggle, isTriggerOn } = createTrigger()

  const [buttonDom, setButtonDom] = createRef<HTMLElement>()
  const [panelDom, setPanelDom] = createRef<HTMLElement>()

  // invoke trigger 
  useGestureHover({
    el: buttonDom,
    onHoverStart: open,
    onHoverEnd: close,
  })

  /**
   * in {@link popoverTriggerPlugin}\
   * plugin registerer for trigger
   * @example
   * <Button plugin={buttonPlugin} />
   */
  const popoverTriggerPlugin = createPlugin(() => () => {
    return {
      domRef: setButtonDom,
      onClick: toggle,
    } satisfies Partial<PivProps>
  })

  const popoverWrapperPlugin = createPlugin(
    () => () =>
      ({
        icss: { position: 'relative', width: 'max-content', height: 'fit-content' },
      }) satisfies Partial<PivProps>,
  )

  /**
   * in {@link popoverTriggerPlugin}\
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
          open()
        } else {
          close()
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
   * in {@link popoverTriggerPlugin}\
   *  public accessors
   */
  const pluginState = {
    buttonDom,
    panelDom,
    isTriggerOn,

    /** open the popover panel */
    open: open,
    close: close,
  }

  return {
    state: pluginState,
    plugins: {
      /** when trigger is invoked, panel will show  */
      trigger: popoverTriggerPlugin,
      panel: popoverPanelPlugin,
      /** mannage prop state */
      containerBox: popoverWrapperPlugin,
    },
  }
}
