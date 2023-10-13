import { MayEnum } from '@edsolater/fnkit'

export type WorkerMessage<T = any> = {
  command: string
  payload: T
}

export type WorkerCommand = MayEnum<
  | 'fetch raydium supported tokens'
  | 'fetch raydium pairs info'
  | 'fetch raydium farms info'
  | 'get raydium farms syn infos'
  | 'get raydium token prices'
  | 'let webworker calculate swap route infos'
>