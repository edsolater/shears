import { expect, test } from 'vitest'
import { createBranchStore } from './createBranch'
import { setLeafVisiable } from './createLeaf'
import { createTask } from './createTask'


test('basic usage', () => {
  let effectRunCount = 0
  const { store } = createBranchStore({ testCount: 1 })
  const effect = createTask([store.testCount], (get) => {
    const n = get(store.testCount)
    expect(n, 'task effect can run ').toBe(1)
    effectRunCount++
  })
  effect.register()
  store.testCount.set((n) => n + 1)
  expect(store.testCount()).toBe(2)
  expect(effectRunCount, 'unvisiable effect not run yet').toBe(0)
  expect(store.testCount.visiable()).toBe(false)
  setLeafVisiable(store.testCount, true)
  store.testCount.set((n) => n + 1)
  expect(effectRunCount, 'effect should run 1 time').toBe(1)
})
