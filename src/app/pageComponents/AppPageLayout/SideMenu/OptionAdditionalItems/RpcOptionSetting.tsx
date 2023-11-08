import {
  Badge,
  Box,
  Icon,
  Input,
  KitProps,
  Loop,
  Panel,
  Piv,
  Row,
  Text,
  cssVar,
  icssCard,
  icssCyberpenkBackground,
  icssDivider,
  makePopover,
  useKitProps,
} from '../../../../../packages/pivkit'
import { RPCEndpoint, availableRpcs } from '../../../../stores/data/store'
import { OptionItemBox } from './OptionItem'

export function RpcSettingFace(kitProps: {
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
      <Panel plugin={popoverPlugins.panel} icss={[{ width: '24rem' }, icssCard, icssCyberpenkBackground]}>
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
      <Loop of={props.availableRpcs} icss={icssDivider}>
        {(rpc) => (
          <RPCPanelItem
            icss={{ paddingBlock: '0.75rem' }}
            rpc={rpc}
            isCurrent={rpc.url === props.currentRPC?.url}
            isLoading={props.isLoading}
            isLoadingCustomizedRPC={props.isLoadingCustomizedRPC}
            isRecommanded={true}
          />
        )}
      </Loop>

      <Row>
        <RPCPanelInput />
      </Row>
    </RPCPanelBox>
  )
}

export function RPCPanelBox(kitProps: KitProps) {
  const { props, shadowProps } = useKitProps(kitProps)
  return (
    <Box shadowProps={shadowProps}>
      <Text
        icss={{
          paddingBlock: '0.75rem',
          // paddingInline: '1.5rem',
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

function RPCPanelItem(
  kitProps: KitProps<{
    rpc: RPCEndpoint
    isRecommanded?: boolean
    isUserCustomized?: boolean
    isCurrent?: boolean
    isLoading?: boolean
    isLoadingCustomizedRPC?: boolean
    onClickRPCItem?: (rpc: RPCEndpoint) => void
    onDeleteRPCItem?: (rpc: RPCEndpoint) => void
  }>,
) {
  const { props, shadowProps } = useKitProps(kitProps)
  const { rpc, isCurrent } = props
  const dotIcss = {
    width: '0.375rem',
    height: '0.375rem',
    background: '#2de680',
    color: '#2de680',
    borderRadius: '50%',
    boxShadow: '0 0 6px 1px currentColor',
  }
  return (
    <Row
      shadowProps={shadowProps}
      class='group flex-wrap gap-3 py-4 px-6 mobile:px-3 border-[rgba(171,196,255,0.05)]'
      onClick={() => {
        props.onClickRPCItem?.(rpc)
      }}
    >
      <Row class='items-center w-full'>
        <Row
          icss={{
            width: '100%',
            color: props.isCurrent ? 'rgba(255,255,255,0.85)' : 'white',
            '&:hover': { color: 'white' },
            transition: 'color 0.2s',
            cursor: 'pointer',
          }}
          icss:gap={'.25rem'}
        >
          <Text icss={{ whiteSpace: 'nowrap' }}>{props.rpc.name ?? '--'}</Text>

          <Row icss={{ gap: '.5rem' }}>
            {props.isRecommanded && <Badge icss={{ color: '#5ac4be' }}>recommended</Badge>}
            {props.isUserCustomized && <Badge icss={{ color: '#c4d6ff' }}>user added</Badge>}
            {props.isCurrent && <Icon>✅</Icon>}
          </Row>

          {/* delete icon */}
          {props.isRecommanded && !props.isCurrent && (
            <Icon
              onClick={({ ev }) => {
                props.onDeleteRPCItem?.(rpc)
                ev.stopPropagation()
              }}
            >
              💥
            </Icon>
          )}
        </Row>
        {props.isLoading && props.isCurrent && <Icon icss={{ marginLeft: '.75rem' }}>💫</Icon>}
      </Row>
    </Row>
  )
}

function RPCPanelInput(kitProps: KitProps<{ customURL?: string }>) {
  const { props, shadowProps } = useKitProps(kitProps)
  return (
    <Box shadowProps={shadowProps}>
      <Input
        // icss={{ fontSize: 'inherit' }}
        value={props.customURL}
        // class={`px-2 py-2 border-1.5 flex-grow ${
        //   switchConnectionFailed
        //     ? 'border-[#DA2EEF]'
        //     : userCostomizedUrlText === currentEndPoint?.url
        //     ? 'border-[rgba(196,214,255,0.8)]'
        //     : 'border-[rgba(196,214,255,0.2)]'
        // } rounded-xl min-w-[7em]`}
        // inputClassName='font-medium text-[rgba(196,214,255,0.5)] placeholder-[rgba(196,214,255,0.5)]'
        placeholder='https://'
        onUserInput={(searchText) => {
          // useConnection.setState({ userCostomizedUrlText: searchText.trim() })
        }}
        onEnter={() => {
          // switchRpc({ url: userCostomizedUrlText }).then((isSuccess) => {
          //   if (isSuccess === true) {
          //     closePanel()
          //   }
          // })
        }}
      />
    </Box>
  )
}
