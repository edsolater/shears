import { AnyFn } from '@edsolater/fnkit'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { ComposeFarmSYNInfoQuery, ComposedFarmSYNInfos, composeFarmSYN } from '../utils/composeFarmSYN'
import { workerCommands } from '../../../utils/webworker/type'

let storedCleanUpFunction: AnyFn | undefined = undefined

export function loadFarmSYNInfos_worker({ getMessagePort }: MessagePortTransformers) {
  const { receiver, sender } = getMessagePort<ComposeFarmSYNInfoQuery, ComposedFarmSYNInfos>(
    workerCommands['get raydium farms syn infos'],
  )
  receiver.subscribe((query) => {
    storedCleanUpFunction?.()
    const { abort, resultSubscribable } = composeFarmSYN(query)
    resultSubscribable.subscribe(sender.query)
    storedCleanUpFunction = abort
  })
}
