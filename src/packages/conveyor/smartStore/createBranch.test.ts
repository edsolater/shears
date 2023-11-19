import { expect, test } from 'vitest'
import { createBranch } from './createBranch'
import { isTaskAtom } from './createTaskAtom'
test(`basic usage`, () => {
  const { store, setStore } = createBranch({ a: 1, b: { c: 2 } })
  setStore({ a: 2 })
  setStore({ b: { c: 3 } })
  expect(isTaskAtom(store.a)).toBe(true)
  expect(store.a()).toBe(2)
  expect(store.a()).toBe(2)
  expect(store.a()).toBe(2)
  expect(isTaskAtom(store.b.c)).toBe(true)
  expect(store.b.c()).toBe(3)
})
