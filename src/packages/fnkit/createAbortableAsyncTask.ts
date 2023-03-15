// make it  possiable to abort inside the progress of task
export function createAbortableAsyncTask<T>(
  task: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, aborted: () => boolean) => void
): { result: Promise<T>; abort(): void } {
  let innerResolve: (value: T | PromiseLike<T>) => void
  let innerReject: (reason?: any) => void
  const abortController = new AbortController()
  const abortableTask = new Promise<T>((resolve, reject) => {
    innerResolve = resolve
    innerReject = reject
    task(resolve, reject, () => abortController.signal.aborted)
  })
  return {
    result: abortableTask,
    abort: () => {
      innerReject('abort by user')
      abortController.abort()
    }
  }
}
