import { JSX } from 'solid-js/web/types/jsx'
import { Piv } from '../../../packages/piv'
import { Box } from '../../../packages/pivkit'
import { ExamplePanel } from '../components/ExamplePanel'
import { NavBar } from '../components/NavBar'
import { useDataStore } from '../stores/data/store'
import { CircularProgress } from '../components/CircularProgress'
import { createEffect, createSignal, onCleanup } from 'solid-js'

export function PlaygroundPage() {
  console.count('load <PlaygroundPage>')
  return (
    <Piv>
      <NavBar title='Playground' />
      <PlaygoundList />
    </Piv>
  )
}

function CircularProgressExample() {
  const [percent100, setPercent100] = createSignal(0)

  const onEnd = () => {
    console.log('onEnd')
  }

  console.count('load <CircularProgressExample>')
  createEffect(() => {
    const interval = setInterval(() => {
      setPercent100((percent100) => {
        if (percent100 >= 100) {
          onEnd()
          return 0
        }
        return percent100 + 1
      })
    }, 100)
    onCleanup(() => clearInterval(interval))
  })

  return <CircularProgress percent={percent100() / 100} />
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
