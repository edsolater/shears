import { createSignal } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { useComponentController } from '../../../packages/piv/hooks/useComponentController'
import { Box, Button, List, Text, icss_col, icss_row } from '../../../packages/pivkit'
import { Drawer, DrawerController } from '../../../packages/pivkit/components/Drawer'
import { Input } from '../../../packages/pivkit/components/Input'
import { Modal, ModalController } from '../../../packages/pivkit/components/Modal'
import { useCSSTransition } from '../../../packages/pivkit/features/useCSSTransition'
import { createIncresingAccessor } from '../../../packages/pivkit/hooks/createIncreasingAccessor'
import { CircularProgress } from '../components/CircularProgress'
import { ExamplePanel } from '../components/ExamplePanel'
import { NavBar } from '../components/NavBar'
import { useLoopPercent } from '../hooks/useLoopPercent'
import { useDataStore } from '../stores/data/store'
import { ListContainerBox } from '../../../packages/pivkit/components/ListContainerBox'

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

      <ExamplePanel name='CSSTransition'>
        <CSSTransitionExample />
      </ExamplePanel>

      <ExamplePanel name='Input'>
        <InputExample />
      </ExamplePanel>

      <ExamplePanel name='Modal'>
        <ModalExample />
      </ExamplePanel>

      <ExamplePanel name='List'>
        <ListExample />
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

function DrawerExample() {
  const drawerController = useComponentController<DrawerController>('big-drawer')
  return (
    <>
      <Button
        onClick={() => {
          console.log('drawerController: ', drawerController)
          return drawerController.toggle?.()
        }}
      >
        Open
      </Button>
      <Drawer id='big-drawer' />
    </>
  )
}

function ModalExample() {
  const modalController = useComponentController<ModalController>('example-modal')
  const modalController2 = useComponentController<ModalController>('example-modal2')
  const couter = createIncresingAccessor()
  return (
    <>
      <Button onClick={() => modalController.toggle?.()}>Open</Button>
      <Modal id='example-modal' isModal>
        Modal1
      </Modal>
      <Button onClick={() => modalController2.toggle?.()}>Open</Button>
      <Modal id='example-modal2' isModal>
        Modal2 + {couter()}
      </Modal>
    </>
  )
}

function CSSTransitionExample() {
  const [show, setShow] = createSignal(false)

  // TODO: invoke in  plugin
  const { transitionProps, refSetter } = useCSSTransition({
    show,
    onAfterEnter() {},
    onBeforeEnter() {},
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

function InputExample() {
  const [controlledValue, setControlledValue] = createSignal<string>()
  setInterval(() => {
    setControlledValue((s) => (s ?? '') + '1')
  }, 500)
  return (
    <Input
      value={controlledValue}
      icss={{ border: 'solid' }}
      onUserInput={({ text }) => {
        setControlledValue(text)
      }}
    />
  )
}

function ListExample() {
  const mockData = [
    { name: 'a', count: 1 },
    { name: 'b', count: 2 },
    { name: 'c', count: 3 },
    { name: 'd', count: 4 },
    { name: 'e', count: 5 },
    { name: 'f', count: 6 },
    { name: 'g', count: 7 },
    { name: 'h', count: 8 },
    { name: 'i', count: 9 },
    { name: 'j', count: 10 },
    { name: 'k', count: 11 },
    { name: 'l', count: 12 },
    { name: 'm', count: 13 },
    { name: 'n', count: 14 },
    { name: 'o', count: 15 },
    { name: 'p', count: 16 },
    { name: 'q', count: 17 },
    { name: 'r', count: 18 },
    { name: 's', count: 19 },
    { name: 't', count: 20 },
    { name: 'u', count: 21 },
    { name: 'v', count: 22 },
    { name: 'w', count: 23 },
    { name: 'x', count: 24 },
    { name: 'y', count: 25 },
    { name: 'z', count: 26 }
  ]
  const increaseCount = createIncresingAccessor()
  return (
    <List
      items={mockData.concat(mockData).concat(mockData).concat(mockData)}
      initRenderCount={10}
      icss={icss_col({ gap: 16 })}
    >
      {(d) => {
        console.count('render item')
        return (
          <Box icss={[icss_row({ gap: 8 }), { padding: 32, background: '#0001', width: '100%' }]}>
            <Text>{d.name}</Text>
            <Text>{d.count + increaseCount()}</Text>
          </Box>
        )
      }}
    </List>
  )
}
