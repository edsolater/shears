export type WorkerMessage<T = any> = {
  description: string
  data: T
}

export type WorkerDescription = 'sdk tokens'
