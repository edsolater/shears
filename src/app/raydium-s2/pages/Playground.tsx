import { Piv } from '../../../packages/piv'
import { Box, Button } from '../../../packages/pivkit'
import { CircularProgress } from '../components/CircularProgress'
import { ExamplePanel } from '../components/ExamplePanel'
import { NavBar } from '../components/NavBar'
import { useDataStore } from '../stores/data/store'
import { useLoopPercent } from '../hooks/useLoopPercent'
import { Drawer } from '../../../packages/pivkit/components/Drawer'

export function PlaygroundPage() {
  return (
    <Piv>
      <NavBar title='Playground' />
      <PlaygoundList />
    </Piv>
  )
}

function PlaygoundList() {
  const dataStore = useDataStore()
  return (
    <Box
      icss={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        padding: '16px 32px 0',
        gap: 16
      }}
    >
      <ExamplePanel name='IntervalCircle'>
        <CircularProgressExample />
      </ExamplePanel>

      <ExamplePanel name='Drawer'>
        <DrawerExample />
      </ExamplePanel>
    </Box>
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

/**
 *
 * @todo 1. fade out when come to the end, not play track back.
 * @todo 2. make percent handler to be a hook
 */
function DrawerExample() {
  // const [receiver, commander] = createDrawerTriggerPair()
  return (
    <>
      <Button>Open Drawer</Button>
      <Drawer/>
    </>
  )
}
