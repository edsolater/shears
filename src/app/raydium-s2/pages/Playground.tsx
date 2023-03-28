import { Piv } from '../../../packages/piv'
import { Box } from '../../../packages/pivkit'
import { CircularProgress } from '../components/CircularProgress'
import { ExamplePanel } from '../components/ExamplePanel'
import { NavBar } from '../components/NavBar'
import { useDataStore } from '../stores/data/store'
import { useLoopPercent } from '../hooks/useLoopPercent'

export function PlaygroundPage() {
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
  const { percent } = useLoopPercent()
  return <CircularProgress percent={percent()} />
}

function PlaygoundList() {
  const dataStore = useDataStore()
  return (
    <Box
      icss={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        padding: '16px 32px 0',
        gap: 16
      }}
    >
      <ExamplePanel name='IntervalCircle'>
        <CircularProgressExample />
      </ExamplePanel>
    </Box>
  )
}
