export type WorkerMessage<T = any> = {
  description: string
  data: T
}

export type WorkerDescription = 'query token info'
