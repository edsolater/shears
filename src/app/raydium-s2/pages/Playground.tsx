import { Piv } from '../../../packages/piv'
import { Box, Button, Collapse } from '../../../packages/pivkit'
import { CircularProgress } from '../components/CircularProgress'
import { ExamplePanel } from '../components/ExamplePanel'
import { NavBar } from '../components/NavBar'
import { useDataStore } from '../stores/data/store'
import { useLoopPercent } from '../hooks/useLoopPercent'
import { Drawer, DrawerController } from '../../../packages/pivkit/components/Drawer'
import { useComponentController } from '../../../packages/piv/propHandlers/controller'

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
  const drawerController = useComponentController<DrawerController>('big-drawer')
  return (
    <>
      <Button onClick={() => drawerController()?.toggle()}>
        {drawerController()?.isOpen ? 'Close' : 'Open'}
        <Collapse open={(console.log('controller', drawerController()?.isOpen), drawerController()?.isOpen)}>
          <Collapse.Face>info</Collapse.Face>
          <Collapse.Content>detail</Collapse.Content>
        </Collapse>
      </Button>
      <Drawer id='big-drawer' />
    </>
  )
}
