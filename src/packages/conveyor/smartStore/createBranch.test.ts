import { expect, test } from 'vitest'
import { createBranch, debranchify } from './createBranch'
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
test(`basic usage`, () => {
  const { store, setStore } = createBranch({ a: 1, b: { c: 2 } })
  setStore({ b: { c: 3 } })
  console.log('store.b: ', store.b)
  const hasDe = debranchify(store.b)
  console.log('hasDe: ', hasDe)

  expect(store.b).toEqual({ c: 3 })
})
