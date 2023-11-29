import { expect, test } from 'vitest'
import { createBranchStore } from './createBranch'
import { createTask } from './createTask'
test('basic usage', () => {
  let effectRunCount = 0
  const { store } = createBranchStore({ testCount: 1 })
  const effect = createTask((get) => {
    const n = get(store.testCount)
    expect(n, 'task effect can run ').toBe(1)
    effectRunCount++
  })
  effect.run()
})
