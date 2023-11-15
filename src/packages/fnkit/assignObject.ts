/** shortcut of Reflect.get */
export function assignObject(obj: object, propertyPairs: Record<string, any>, getters?: Record<string, () => any>) {
  Object.entries(propertyPairs).forEach(([key, value]) => {
    Reflect.set(obj, key, value)
  })
  if (getters) {
    assignObjectWithGetter(obj, getters)
  }
}

/**
 * shortcut of Object.defineProperty
 * @param obj target object
 * @param rules
 */
export function assignObjectWithGetter(obj: object, rules: Record<string, () => any>) {
  Object.entries(rules).forEach(([key, value]) => {
    Object.defineProperty(obj, key, {
      get() {
        return value()
      },
    })
  })
}
