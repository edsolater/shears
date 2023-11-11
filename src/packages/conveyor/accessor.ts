const observers: (() => void)[] = []

const getCurrentObserver = () => {
  return observers[observers.length - 1]
}

const createSignal = (value) => {
  const effectSubscriber = new Set<() => void>()
  const getter = () => {
    // inject signal observer
    const currentObserver = getCurrentObserver()
    if (currentObserver) effectSubscriber.add(currentObserver)
    return value
  }
  // 修改 Signal value
  const setter = (newValue) => {
    value = newValue
    // 将所有订阅了当前 Signal 变化的 Observer 一次性都取出来并执行
    effectSubscriber.forEach((subscriber) => subscriber())
  }
  return [getter, setter]
}

const createEffect = (effect) => {
  const execute = () => {
    // 无论是否在副作用函数中调用了 Signal getter
    // 先假设副作用函数为某个 Signal 的 Observer
    // 将其存储至 observers 中
    observers.push(execute)
    try {
      // 执行副作用函数
      // 若副作用函数确实为某个 Signal 的 Observer（即副作用函数中调用了 Signal getter）
      // 则在 Signal getter 中会将 execute 存储至内部的 subscribers 中
      // 否则不执行任何操作
      effect()
    } finally {
      // 删除副作用函数
      observers.pop()
    }
  }
  // 副作用函数立即执行
  execute()
}
