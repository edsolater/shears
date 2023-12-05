import { shuckOptionTag } from './shuck'

export type ShuckOption<T = any> = {
  value: T
  visiable: boolean
  [shuckOptionTag]: true
}

export function createShuckOption<T>(description: { value: T; visiable: boolean }): ShuckOption<T> {
  return {
    value: description.value,
    visiable: description.visiable,
    [shuckOptionTag]: true,
  }
}
export function isShuckOption<T>(value: any): value is ShuckOption<T> {
  return value?.[shuckOptionTag]
}
