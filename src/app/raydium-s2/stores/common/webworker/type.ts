import { MayEnum } from '@edsolater/fnkit'

export type WorkerMessage<T = any> = {
  description: string
  data: T
}

export type WorkerDescription =
  | 'fetch raydium supported tokens'
  | 'fetch raydium pairs info'
  | 'fetch raydium farms info'
  | 'parse raydium farms info sdk list'
