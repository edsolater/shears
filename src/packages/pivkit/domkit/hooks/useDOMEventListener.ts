import { createEffect, onCleanup } from 'solid-js'
import { onEvent } from '..'
import { EventListenerController } from '..'
import { ElementAccessors, GetElementsFromElementAccessors, getElementsFromAccessors } from '../../utils/elementAccessors'

/**
 * register DOM Event Listener
 * use auto cleanup
 */
export function useDOMEventListener<El extends ElementAccessors, K extends keyof HTMLElementEventMap>(
  el: El,
  eventName: K,
  fn: (payload: {
    ev: HTMLElementEventMap[K]
    el: GetElementsFromElementAccessors<El>
    eventListenerController: EventListenerController
  }) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions
) {
  createEffect(() => {
    const els = getElementsFromAccessors(el)
    els.forEach((el) => {
      // @ts-expect-error no need to check
      const { abort: cancel } = onEvent(el, eventName, fn, options)
      onCleanup(cancel)
    })
  })
}

/**
 * register DOM Event Listener
 * use auto cleanup
 */
export function useDocumentEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  fn: (payload: { ev: HTMLElementEventMap[K]; el: Document; eventListenerController: EventListenerController }) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions
) {
  createEffect(() => {
    const { abort: cancel } = onEvent(globalThis.document, eventName, fn, options)
    onCleanup(cancel)
  })
}

/**
 * register DOM Event Listener
 * use auto cleanup
 */
export function useWindowEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  fn: (payload: { ev: HTMLElementEventMap[K]; el: Window; eventListenerController: EventListenerController }) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions
) {
  createEffect(() => {
    const { abort: cancel } = onEvent(globalThis.window, eventName, fn, options)
    onCleanup(cancel)
  })
}
