import { shrinkFn } from '@edsolater/fnkit'
import { Accessor, createSignal } from 'solid-js'

export function createDisclosure(config?: { open?: Accessor<boolean>; onOpen?: () => void; onClose?: () => void }) {
  const [isOpen, setInnerOpen] = createSignal(shrinkFn(config?.open) ?? false)
  function open() {
    setInnerOpen(true)
    config?.onOpen?.()
  }
  function close() {
    setInnerOpen(false)
    config?.onClose?.()
  }
  function toggle() {
    isOpen() ? close() : open()
  }

  return { isOpen, open, close, toggle }
}
