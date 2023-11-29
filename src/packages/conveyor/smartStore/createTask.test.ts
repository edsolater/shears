import { expect, test } from 'vitest'
import { createBranchStore } from './createBranch'
import { createTask } from './createTask'
test('basic usage', () => {
  let effectRunCount = 0
  const { store } = createBranchStore({ testCount: 1 })
  const effect = createTask([store.testCount], (get) => {
    const n = get(store.testCount)
    expect(n, 'task effect can run ').toBe(1)
    effectRunCount++
  })
  effect.run()
  store.testCount.set((n) => n + 1)
  store.testCount.set((n) => n + 1)
  expect(store.testCount()).toBe(3)
  expect(effectRunCount, 'effect should have run 3 times').toBe(3)
})
