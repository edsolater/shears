export type WorkerMessage<T = any> = {
  description: string
  data: T
}

export type WorkerDescription = 'fetch raydium supported tokens' | 'fetch raydium pair info'
