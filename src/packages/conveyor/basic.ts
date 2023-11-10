type SmartStoreOption = {}

type SmartStoreDefaultValue = Record<keyof any, any>

/** create Store by subscribable */
export function smartStore<T extends SmartStoreDefaultValue>(defaultValue?: T, options?: SmartStoreOption) {
  const innerStore: {[K in keyof T]: T[]} = {}
  if (defaultValue) {
    const defaultSymbolPairs = Object.getOwnPropertySymbols(defaultValue).map((key) => [key, defaultValue[key]])
    const defaultStringPairs = Object.entries(defaultValue)
    for (const [key, value] of defaultSymbolPairs.concat(defaultStringPairs)) {
      
    }
  }
}
