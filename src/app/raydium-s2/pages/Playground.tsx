import { Piv } from '../../../packages/piv'
import { Box, Button, Collapse } from '../../../packages/pivkit'
import { CircularProgress } from '../components/CircularProgress'
import { ExamplePanel } from '../components/ExamplePanel'
import { NavBar } from '../components/NavBar'
import { useDataStore } from '../stores/data/store'
import { useLoopPercent } from '../hooks/useLoopPercent'
import { Drawer, DrawerController } from '../../../packages/pivkit/components/Drawer'
import { useComponentController } from '../../../packages/piv/propHandlers/controller'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { useCSSTransition } from '../../../packages/pivkit/features/useCSSTransition'

export function PlaygroundPage() {
  return (
    <Piv>
      <NavBar title='Playground' />
      <PlaygoundList />
    </Piv>
  )
}

function PlaygoundList() {
  console.log('6: ', 6)
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

      <ExamplePanel name='CSSTransition'>
        <CSSTransitionExample />
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
 */
function DrawerExample() {
  console.log('5: ', 5)
  const drawerController = useComponentController<DrawerController>('big-drawer')
  return (
    <>
      <Button onClick={() => drawerController.toggle?.()}>
        <Collapse open>
          <Collapse.Face>{(controller) => (controller.isOpen ? 'Close' : 'Open')}</Collapse.Face>
          <Collapse.Content>detail info</Collapse.Content>
        </Collapse>
      </Button>
      <Drawer id='big-drawer' />
    </>
  )
}

function CSSTransitionExample() {
  const [show, setShow] = createSignal(false)

  // TODO: invoke in  plugin 
  const { transitionProps, refSetter } = useCSSTransition({
    show,
    onAfterEnter(controller) {
      console.log('controller: ', { ...controller })
    },
    onBeforeEnter(controller) {},
    fromProps: { icss: { width: '100px' } },
    toProps: { icss: { width: '200px' } }
  })

  // createEffect(() => {
  //   // @ts-ignore
  //   console.log('transitionProps: ', transitionProps().icss?.width)
  //   console.log('show: ', show())
  // })

  return (
    <>
      <Button onClick={() => setShow((b) => !b)}>Toggle</Button>
      <Piv
        ref={refSetter}
        shadowProps={transitionProps()}
        icss={{ backgroundColor: 'dodgerblue', height: 200, display: 'grid', placeItems: 'center' }}
      >
        <Box>hello</Box>
      </Piv>
    </>
  )
}
