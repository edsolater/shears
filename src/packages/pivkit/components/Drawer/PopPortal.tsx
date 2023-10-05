import { createEffect } from 'solid-js'
import { Portal } from 'solid-js/web'
import { createRef } from '../..'
import isClientSide from '../../../jFetch/utils/isSSR'
import { RawChild } from '../../piv/typeTools'

export function PopPortal(props: { id: string; children?: RawChild }) {
  const element = createPopStackHTMLElement(props.id)
  const [ref, setRef] = createRef()
  createEffect(() => {
    ref()?.classList.add('self-pointer-events-none')
  })
  return (
    <Portal mount={element} ref={setRef}>
      {props.children}
    </Portal>
  )
}
function createPopStackHTMLElement(id: string) {
  const el = document.querySelector(`#${id}`)
  if ('document' in globalThis && !el) {
    const div = document.createElement('div')
    div.id = id
    document.body.appendChild(div)
    div.style.position = 'fixed'
    div.style.inset = '0'
    div.classList.add('self-pointer-events-none')
    insertCSSPointerEventNone()
    return div
  } else {
    return el ?? undefined
  }
}

function insertCSSPointerEventNone() {
  if (!isClientSide()) return
  const styleEl = document.createElement('style')

  // Append <style> element to <head>
  document.head.appendChild(styleEl)

  styleEl.sheet?.insertRule(`:where(.self-pointer-events-none) {pointer-events:none}`)
  styleEl.sheet?.insertRule(`:where(.self-pointer-events-none) * {pointer-events:initial}`) // :where() always has 0 specificity -- MDN
}
