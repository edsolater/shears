export type WorkerMessage<T = any> = {
  description: string;
  data: T;
};
