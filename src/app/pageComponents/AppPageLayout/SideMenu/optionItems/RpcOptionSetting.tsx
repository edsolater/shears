import {
  Box,
  KitProps,
  Panel,
  Piv,
  Row,
  Text,
  cssVar,
  icssCard,
  icssCyberpenkBackground,
  makePopover,
  useKitProps,
} from '../../../../../packages/pivkit'
import { RPCEndpoint, availableRpcs } from '../../../../stores/data/store'
import { OptionItemBox } from './OptionItem'

export function RpcItemFace(kitProps: {
  currentRPC?: RPCEndpoint
  isLoading?: boolean
  isLoadingCustomizedRPC?: boolean
}) {
  const { props, shadowProps } = useKitProps(kitProps)
  const { plugins: popoverPlugins } = makePopover({
    placement: 'right',
    triggerBy: 'click',
    defaultOpen: true,
  }) // <-- run on define, not good
  const dotIcss = {
    width: '0.375rem',
    height: '0.375rem',
    background: '#2de680',
    color: '#2de680',
    borderRadius: '50%',
    boxShadow: '0 0 6px 1px currentColor',
  }
  return (
    <>
      <OptionItemBox
        plugin={popoverPlugins.trigger}
        render:arrow
        render:dot={<Piv icss={dotIcss}></Piv>}
        shadowProps={shadowProps}
      >
        RPC
      </OptionItemBox>
      <Panel plugin={popoverPlugins.panel} icss={[icssCard, icssCyberpenkBackground]}>
        <RPCPanel
          currentRPC={props.currentRPC}
          availableRpcs={availableRpcs}
          isLoading={props.isLoading}
          isLoadingCustomizedRPC={props.isLoadingCustomizedRPC}
        ></RPCPanel>
      </Panel>
    </>
  )
}

function RPCPanel(props: {
  currentRPC?: RPCEndpoint
  availableRpcs?: RPCEndpoint[]
  isLoading?: boolean
  isLoadingCustomizedRPC?: boolean
}) {
  return (
    <RPCPanelBox>
      {props.availableRpcs?.map((rpc, idx) => {
        const isCurrent = Boolean(idx % 2)
        return (
          <RPCItem
            rpc={rpc}
            isCurrent={rpc.url === props.currentRPC?.url}
            isLoading={props.isLoading}
            isLoadingCustomizedRPC={props.isLoadingCustomizedRPC}
          />
        )
      })}
    </RPCPanelBox>
  )
}

export function RPCPanelBox(kitProps: KitProps) {
  const { props, shadowProps } = useKitProps(kitProps)
  return (
    <Box shadowProps={shadowProps}>
      <Text
        icss={{
          // paddingTop: '0.75rem',
          // paddingInline: '1.5rem',
          marginTop: '-0.75rem',
          color: cssVar('--secondary-half'),
          fontSize: '0.75rem',
        }}
      >
        RPC CONNECTION
      </Text>
      {props.children}
    </Box>
  )
}

function RPCItem(kitProps: {
  rpc: RPCEndpoint
  isCurrent?: boolean
  isLoading?: boolean
  isLoadingCustomizedRPC?: boolean
}) {
  const { props, shadowProps } = useKitProps(kitProps)
  const { rpc, isCurrent } = props
  const { plugins: popoverPlugins } = makePopover({ placement: 'right', triggerBy: 'click' })
  const dotIcss = {
    width: '0.375rem',
    height: '0.375rem',
    background: '#2de680',
    color: '#2de680',
    borderRadius: '50%',
    boxShadow: '0 0 6px 1px currentColor',
  }
  return <Row shadowProps={shadowProps}>{props.rpc.name}</Row>
}
