export type WorkerMessage<T = any> = {
  description: string
  data: T
}

export type WorkerDescription =
  | 'fetch raydium supported tokens'
  | 'fetch raydium pairs info'
  | 'fetch raydium farms info'
  | 'get raydium farms syn infos'
  | 'get raydium token prices'
  | 'get webworker calculate swap route infos'
