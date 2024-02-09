import type { Sender, SenderMessage, Receiver, ReceiveMessage } from './createMessagePortTransforers'
import { getMessagePort } from './loadWorker_main'

export function useMessagePort<Query, Data>(options: {
  command: string
  queryPayload?: Query
  onBeforeSend?: () => void
  onReceive: (jsonInfos: Data) => void
  onActionError?: (error?: unknown) => void
}) {
  const { sender, receiver } = getMessagePort(options.command)
  options.onBeforeSend?.()
  const { query } = sender as Sender<SenderMessage<Query>>
  query(options.queryPayload)
  const { subscribe: receive } = receiver as Receiver<ReceiveMessage<Data>>
  receive(options.onReceive)
}
