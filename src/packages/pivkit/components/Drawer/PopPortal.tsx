import { createEffect } from 'solid-js'
import { Portal } from 'solid-js/web'
import { createRef } from '../..'
import isClientSide from '../../../jFetch/utils/isSSR'
import { RawChild } from '../../../piv'

export function PopPortal(props: { children?: RawChild }) {
  const element = createPopStackHTMLElement()
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

function createPopStackHTMLElement() {
  if ('document' in globalThis) {
    const div = document.createElement('div')
    div.id = 'pop-stack'
    document.body.appendChild(div)
    div.style.position = 'fixed'
    div.style.inset = '0'
    div.classList.add('self-pointer-events-none')
    insertCSSPointerEventNone()
    return div
  }
}
let hasInserted = false
function insertCSSPointerEventNone() {
  if (!isClientSide()) return
  if (hasInserted) return
  hasInserted = true
  const styleEl = document.createElement('style')

  // Append <style> element to <head>
  document.head.appendChild(styleEl)

  styleEl.sheet?.insertRule(`:where(.self-pointer-events-none) {pointer-events:none}`)
  styleEl.sheet?.insertRule(`:where(.self-pointer-events-none) * {pointer-events:initial}`) // :where() always has 0 specificity -- MDN
}
