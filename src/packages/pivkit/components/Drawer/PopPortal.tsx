import { createEffect } from 'solid-js'
import { Portal } from 'solid-js/web'
import { createRef } from '../..'
import isClientSide from '../../../jFetch/utils/isSSR'
import { RawChild } from '../../../piv'

export function PopPortal(props: { id: string; children?: RawChild }) {
  console.log('3: ', 3 , props.children)
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
  console.log('2: ', 2, id)
  if ('document' in globalThis) {
    const div = document.createElement('div')
    console.log('div: ', div)
    div.id = id
    document.body.appendChild(div)
    console.log('1: ', 1)
    div.style.position = 'fixed'
    div.style.inset = '0'
    div.classList.add('self-pointer-events-none')
    insertCSSPointerEventNone()
    return div
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
