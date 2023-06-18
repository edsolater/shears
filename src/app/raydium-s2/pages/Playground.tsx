import { createEffect, createSignal, onCleanup } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { useComponentController } from '../../../packages/piv'
import { Box, Button, List, Radio, Text, createIntervalEffect, icss_col, icss_row } from '../../../packages/pivkit'
import { Drawer, DrawerController } from '../../../packages/pivkit'
import { Input } from '../../../packages/pivkit'
import { Modal, ModalController } from '../../../packages/pivkit'
import { Switch } from '../../../packages/pivkit'
import { renderSwitchThumb } from '../../../packages/pivkit'
import { useCSSTransition } from '../../../packages/pivkit'
import { createIncresingAccessor } from '../../../packages/pivkit'
import { CircularProgress } from '../components/CircularProgress'
import { ExamplePanel } from '../components/ExamplePanel'
import { NavBar } from '../components/NavBar'
import { useLoopPercent } from '../hooks/useLoopPercent'
import { useDataStore } from '../stores/data/store'

export default function PlaygroundPage() {
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
        gap: 16,
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

      <ExamplePanel name='Text'>
        <TextExample />
      </ExamplePanel>

      <ExamplePanel name='Modal'>
        <ModalExample />
      </ExamplePanel>

      <ExamplePanel name='List'>
        <ListExample />
      </ExamplePanel>

      <ExamplePanel name='Switch'>
        <SwitchExample />
      </ExamplePanel>

      <ExamplePanel name='Radio'>
        <RadioExample />
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
    toProps: { icss: { width: '200px' } },
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
        domRef={refSetter}
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

function SwitchExample() {
  const [checked, setChecked] = createSignal(false)

  createIntervalEffect(() => {
    setChecked((b) => !b)
  }, 1200)

  return (
    <>
      <Piv
        class={checked() ? 'checked' : ''}
        render:firstChild={
          <Piv
            icss={{
              color: checked() ? 'dodgerblue' : 'crimson',
              width: '0.5em',
              height: '0.5em',
              backgroundColor: 'currentcolor',
              transition: '300ms',
            }}
          />
        }
      />
      <Switch
        name='theme-switch'
        isChecked={checked()}
        style={({ isChecked }) => ({ color: isChecked() ? 'snow' : 'white' })} // <-- will cause rerender , why?
        plugin={renderSwitchThumb()}
      />
    </>
  )
}

function TextExample() {
  return <Text editable>can edit content</Text>
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
    { name: 'z', count: 26 },
    { name: 'aa', count: 26 + 1 },
    { name: 'ab', count: 26 + 2 },
    { name: 'ac', count: 26 + 3 },
    { name: 'ad', count: 26 + 4 },
    { name: 'ae', count: 26 + 5 },
    { name: 'af', count: 26 + 6 },
    { name: 'ag', count: 26 + 7 },
    { name: 'ah', count: 26 + 8 },
    { name: 'ai', count: 26 + 9 },
    { name: 'aj', count: 26 + 10 },
    { name: 'ak', count: 26 + 11 },
    { name: 'al', count: 26 + 12 },
    { name: 'am', count: 26 + 13 },
    { name: 'an', count: 26 + 14 },
    { name: 'ao', count: 26 + 15 },
    { name: 'ap', count: 26 + 16 },
    { name: 'aq', count: 26 + 17 },
    { name: 'ar', count: 26 + 18 },
    { name: 'as', count: 26 + 19 },
    { name: 'at', count: 26 + 20 },
    { name: 'au', count: 26 + 21 },
    { name: 'av', count: 26 + 22 },
    { name: 'aw', count: 26 + 23 },
    { name: 'ax', count: 26 + 24 },
    { name: 'ay', count: 26 + 25 },
    { name: 'az', count: 26 + 26 },
  ]
  const [data, setData] = createSignal<typeof mockData>([])
  const increaseCount = createIncresingAccessor()
  createEffect(() => {
    setTimeout(() => {
      setData(mockData)
    }, 100)
  })
  return (
    <List items={data} initRenderCount={10} icss={[icss_col({ gap: 16 }), { height: '30dvh' }]}>
      {(d, idx) => {
        console.count(`render item from <Playground>, ${d.name}, ${d.count}`)
        return (
          <Box icss={[icss_row({ gap: 8 }), { background: '#0001', width: '100%' }]}>
            <Text>{d.name}</Text>
            <Text>{d.count + increaseCount()}</Text>
          </Box>
        )
      }}
    </List>
  )
}

function RadioExample() {
  const [checked, setChecked] = createSignal(false)

  createIntervalEffect(() => {
    setChecked((b) => !b)
  }, 1200)

  return <Radio name='gender' isChecked={checked()} />
}
