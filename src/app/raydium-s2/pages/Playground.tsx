import { createSignal } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { useComponentController } from '../../../packages/piv/hooks/useComponentController'
import { Box, Button, Collapse } from '../../../packages/pivkit'
import { Drawer, DrawerController } from '../../../packages/pivkit/components/Drawer'
import { Input } from '../../../packages/pivkit/components/Input'
import { Modal, ModalController } from '../../../packages/pivkit/components/Modal'
import { useCSSTransition } from '../../../packages/pivkit/features/useCSSTransition'
import { CircularProgress } from '../components/CircularProgress'
import { ExamplePanel } from '../components/ExamplePanel'
import { NavBar } from '../components/NavBar'
import { useLoopPercent } from '../hooks/useLoopPercent'
import { useDataStore } from '../stores/data/store'

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
  const modalController3 = useComponentController<ModalController>('example-modal3')
  const modalController4 = useComponentController<ModalController>('example-modal4')
  const modalController5 = useComponentController<ModalController>('example-modal5')
  return (
    <>
      <Button onClick={() => modalController.toggle?.()}>Open</Button>
      <Modal id='example-modal' isModal>Modal1</Modal>
      <Button onClick={() => modalController2.toggle?.()}>Open</Button>
      <Modal id='example-modal2' isModal>Modal2</Modal>
      <Button onClick={() => modalController3.toggle?.()}>Open</Button>
      <Modal id='example-modal3' isModal>Modal3</Modal>
      <Button onClick={() => modalController4.toggle?.()}>Open</Button>
      <Modal id='example-modal4' isModal>Modal4</Modal>
      <Button onClick={() => modalController5.toggle?.()}>Open</Button>
      <Modal id='example-modal5' isModal>Modal5</Modal>
    </>
  )
}

function CSSTransitionExample() {
  const [show, setShow] = createSignal(false)

  // TODO: invoke in  plugin
  const { transitionProps, refSetter } = useCSSTransition({
    show,
    onAfterEnter({ controller }) {
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
