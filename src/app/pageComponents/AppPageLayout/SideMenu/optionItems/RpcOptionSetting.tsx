import {
  Box,
  Icon,
  KitProps,
  Panel,
  Piv,
  PivChild,
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
      {props.availableRpcs?.map((rpc) => (
        <RPCPanelItem
          rpc={rpc}
          isCurrent={rpc.url === props.currentRPC?.url}
          isLoading={props.isLoading}
          isLoadingCustomizedRPC={props.isLoadingCustomizedRPC}
          isRecommanded={true}
        />
      ))}
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

function RPCPanelItem(kitProps: {
  rpc: RPCEndpoint
  isRecommanded?: boolean
  isUserCustomized?: boolean
  isCurrent?: boolean
  isLoading?: boolean
  isLoadingCustomizedRPC?: boolean
  onClickItem?: (rpc: RPCEndpoint) => void
  onDeleteItem?: (rpc: RPCEndpoint) => void
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
  return (
    <Row
      shadowProps={shadowProps}
      class='group flex-wrap gap-3 py-4 px-6 mobile:px-3 border-[rgba(171,196,255,0.05)]'
      onClick={() => {
        props.onClickItem?.(rpc)
      }}
    >
      <Row class='items-center w-full'>
        <Row
          class={`${
            props.isCurrent
              ? 'text-[rgba(255,255,255,0.85)]'
              : 'hover:text-white active:text-white text-white cursor-pointer'
          } items-center w-full`}
        >
          {props.rpc.name ?? '--'}
          {props.isRecommanded && <Badge class='self-center ml-2'>recommended</Badge>}
          {props.isUserCustomized && (
            <Badge class='self-center ml-2' cssColor='#c4d6ff'>
              user added
            </Badge>
          )}
          {props.isCurrent && <Icon>✅</Icon>}

          {/* delete icon */}
          {props.isRecommanded && !props.isCurrent && (
            <Icon
              onClick={({ ev }) => {
                props.onDeleteItem?.(rpc)
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

type BadgeType = {
  cssColor?: string
  cssBgColor?: string
  noOutline?: boolean
  /** default: outline */
  type?: 'solid' | 'outline'
  /** default 'md' */
  size?: 'md' | 'sm'
  /** usually, it appear with onClick */
  hoverChildren?: PivChild
}

export function Badge(kitProps: KitProps<BadgeType>) {
  const { props, shadowProps } = useKitProps(kitProps)
  const defaultSize = props.size ?? 'md'
  return (
    <Row
      // class={twMerge(
      //   `relative group text-center items-center ${defaultSize === 'sm' ? 'px-1 text-2xs' : 'px-2 text-xs'} ${
      //     props.type === 'solid'
      //       ? 'bg-current text-white'
      //       : `${props.noOutline ? '' : defaultSize === 'sm' ? 'border' : 'border-1.5'} border-current`
      //   } rounded-full capitalize`,
      //   props.class,
      // )}
      // style={{
      //   color: props.cssColor ?? '#5ac4be',
      //   backgroundColor: props.cssBgColor,
      // }}
      icss={{}}
      shadowProps={shadowProps}
    >
      {props.hoverChildren && (
        <Piv class='absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300'>
          {props.hoverChildren}
        </Piv>
      )}
      <Piv class={props.hoverChildren ? 'group-hover:opacity-0 transition duration-300' : undefined}>
        {props.children}
      </Piv>
    </Row>
  )
}
