import { AnyFn } from '@edsolater/fnkit'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { composeFarmSYN } from '../utils/composeFarmSYN'

let storedCleanUpFunction: AnyFn | undefined = undefined

export function loadFarmSYNInfos_worker(transformers: MessagePortTransformers) {
  const { receiver, sender } = transformers.getMessagePort('get raydium farms syn infos')
  console.log('get raydium farms syn infos')
  receiver.subscribe((payload) => {
    storedCleanUpFunction?.()
    const { abort, resultSubscribable } = composeFarmSYN(payload)
    resultSubscribable.subscribe(sender.query)
    storedCleanUpFunction = abort
  })
}
