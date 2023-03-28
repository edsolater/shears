import { createEffect, createSignal, onCleanup } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Box } from '../../../packages/pivkit'
import { CircularProgress } from '../components/CircularProgress'
import { ExamplePanel } from '../components/ExamplePanel'
import { NavBar } from '../components/NavBar'
import { useDataStore } from '../stores/data/store'

export function PlaygroundPage() {
  console.count('load <PlaygroundPage>')
  return (
    <Piv>
      <NavBar title='Playground' />
      <PlaygoundList />
    </Piv>
  )
}

/**
 *
 * @todo 1. fade out when come to the end, not play track back.
 * @todo 2. make percent handler to be a hook
 */
function CircularProgressExample() {
  const [percent100, setPercent100] = createSignal(0)

  const onEnd = () => {
    console.log('onEnd')
  }
  console.count('load <CircularProgressExample>')
  createEffect(() => {
    const { cancel } = requestLoopAnimationFrame(() => {
      setPercent100((percent100) => {
        if (percent100 >= 100) {
          onEnd()
          return 0
        }
        return percent100 + 1
      })
    })
    onCleanup(cancel)
  })

  return <CircularProgress percent={percent100() / 100} />
}

/**
 * TODO: move to fnkit
 * @todo option:endUntil、option:eachMS、option:eachFrameCount
 */
function requestLoopAnimationFrame(
  fn: FrameRequestCallback,
  options?: {
    /** if ture, cancel the frame loop */
    endUntil?: () => boolean
  }
) {
  let rAFId: number
  const frameCallback = (...args: Parameters<FrameRequestCallback>) => {
    fn(...args)
    globalThis.requestAnimationFrame(frameCallback)
  }
  rAFId = globalThis.requestAnimationFrame(frameCallback)
  return {
    rAFId() {
      return rAFId
    },
    cancel() {
      return globalThis.cancelAnimationFrame(rAFId)
    }
  }
}

function PlaygoundList() {
  const dataStore = useDataStore()
  console.count('load <PlaygoundList>')
  return (
    <Box
      icss={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        padding: '16px 32px 0',
        gap: 16
      }}
    >
      <ExamplePanel name='DEV'>{(console.log(1), (<CircularProgressExample />))}</ExamplePanel>
    </Box>
  )
}
