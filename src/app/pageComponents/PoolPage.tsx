import { Box, Button, Group, Icon, KitProps, Piv, Row, Text, icss_clickable, useKitProps } from '../../packages/pivkit'
import { DatabaseTable } from '../components/DatabaseTable'
import { Token } from '../components/TokenProps'
import { createStorePropertySignal } from '../stores/data/store'
import { PairInfo } from '../stores/data/types/pairs'

type PoolItemFaceProps = KitProps<{ item: PairInfo }>

function PoolItemFace(kitProps: PoolItemFaceProps) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'PoolItemFace' })
  const isFavourite = () => false
  return (
    <Row
      shadowProps={shadowProps}
      icss={{
        paddingBlock: '20px',
        background: '#141041',
        gap: '8px',
        display: 'grid',
        gridTemplateColumns: 'auto 1.6fr 1fr 1fr 1fr .8fr auto',
        transition: 'all 150ms',
      }}
    >
      <Box
        icss={{
          width: '24px',
          alignSelf: 'center',
          marginLeft: '24px',
          marginRight: '8px',
        }}
      >
        <Icon
          src={isFavourite() ? '/icons/misc-star-filled.svg' : '/icons/misc-star-empty.svg'}
          onClick={({ ev }) => {
            ev.stopPropagation()
            // onUnFavorite?.(deAccessify(props.item).ammId)
            // onStartFavorite?.(deAccessify(props.item).ammId)
          }}
          icss={[icss_clickable, { margin: 'auto', alignSelf: 'center' }]}
        />
      </Box>

      <PoolItemFaceTokenAvatarLabel info={kitProps.item} />

      <PoolItemFaceDetailInfoBoard name='Liquidity' value={1231} />
      {/*<TextInfoItem
        name={`Volume(${timeBasis})`}
        value={
          timeBasis === '24H'
            ? toUsdVolume((correspondingJsonInfo ?? info).volume24h, { autoSuffix: isTablet, decimalPlace: 0 })
            : timeBasis === '7D'
              ? toUsdVolume((correspondingJsonInfo ?? info).volume7d, { autoSuffix: isTablet, decimalPlace: 0 })
              : toUsdVolume((correspondingJsonInfo ?? info).volume30d, { autoSuffix: isTablet, decimalPlace: 0 })
        }
      />
      <TextInfoItem
        name={`Fees(${timeBasis})`}
        value={
          timeBasis === '24H'
            ? toUsdVolume((correspondingJsonInfo ?? info).fee24h, { autoSuffix: isTablet, decimalPlace: 0 })
            : timeBasis === '7D'
              ? toUsdVolume((correspondingJsonInfo ?? info).fee7d, { autoSuffix: isTablet, decimalPlace: 0 })
              : toUsdVolume((correspondingJsonInfo ?? info).fee30d, { autoSuffix: isTablet, decimalPlace: 0 })
        }
      />
      <TextInfoItem
        name={`APR(${timeBasis})`}
        value={
          timeBasis === '24H'
            ? formatApr((correspondingJsonInfo ?? info).apr24h, { alreadyPercented: true })
            : timeBasis === '7D'
              ? formatApr((correspondingJsonInfo ?? info).apr7d, { alreadyPercented: true })
              : formatApr((correspondingJsonInfo ?? info).apr30d, { alreadyPercented: true })
        }
      />
      <Grid className='w-9 h-9 mr-8 place-items-center'>
        <Icon size='sm' heroIconName={`${open ? 'chevron-up' : 'chevron-down'}`} />
      </Grid> */}
    </Row>
  )
}

function PoolItemFaceDetailInfoBoard(kitProps: KitProps<{ name: string; value?: any }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseListItemFaceDetailInfoBoard' })
  return <Text shadowProps={shadowProps}>{props.value || '--'}</Text>
}

function PoolItemFaceTokenAvatarLabel(kitProps: KitProps<{ info?: PairInfo }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'DatabaseListItemFaceTokenAvatarLabel' })
  return (
    <Box>
      <Token />
    </Box>
  )
}

type PoolItemContentProps<T> = KitProps<{ item: T }>

function PoolItemContent<T>(kitProps: PoolItemContentProps<T>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'PoolItemContent' })
  const isFavourite = () => false
  return (
    <Row
      icss={{
        background: 'linear-gradient(126.6deg, rgba(171, 196, 255, 0.12), rgb(171 196 255 / 4%) 100%)',
        justifyContent: 'space-between',
      }}
    >
      <Group
        name='collapse detail infos'
        icss={{
          paddingBlock: '20px',
          paddingInline: '24px',
          gap: '4vw',
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
      >
        <Row>
          <Box icss={{ flexGrow: 1 }}>
            <Text icss={{ color: '#abc4ff88', fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
              Your Liquidity
            </Text>
            {/* <div className="text-white font-medium text-base mobile:text-xs">
              {toUsdVolume(toTotalPrice(balances[info.lpMint], prices[info.lpMint]))}
            </div>
            <div className="text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs">
              {isHydratedPoolItemInfo(info) ? toString(balances[info.lpMint] ?? 0) + ' LP' : '--'}
            </div> */}
          </Box>
        </Row>
      </Group>

      <Row
        icss={{
          paddingBlock: '8px',
          paddingInline: '24px',
          gap: '12px',
          justifyContent: 'center',
        }}
      >
        <Button
          onClick={() => {
            // routeTo('/liquidity/add', {
            //   queryProps: {
            //     ammId: info.ammId,
            //   },
            // })
          }}
        >
          Add Liquidity
        </Button>
        {/* <Tooltip>
          <Icon
            size='smi'
            iconSrc='/icons/pools-farm-entry.svg'
            className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable-filter-effect ${
              correspondingFarm ? 'clickable' : 'not-clickable'
            }`}
            onClick={() => {
              routeTo('/farms', {
                //@ts-expect-error no need to care about enum of this error
                queryProps: objectShakeFalsy({
                  currentTab: correspondingFarm?.category ? capitalize(correspondingFarm?.category) : undefined,
                  newExpandedItemId: toPubString(correspondingFarm?.id),
                  searchText: info.lpMint,
                }),
              })
            }}
          />
          <Tooltip.Panel>Farm</Tooltip.Panel>
        </Tooltip>
        <Tooltip>
          <Icon
            size='smi'
            iconSrc='/icons/pools-remove-liquidity-entry.svg'
            className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] ${
              hasLp ? 'opacity-100 clickable clickable-filter-effect' : 'opacity-50 not-clickable'
            }`}
            onClick={() => {
              hasLp &&
                routeTo('/liquidity/add', {
                  queryProps: {
                    ammId: info.ammId,
                    mode: 'removeLiquidity',
                  },
                })
            }}
          />
          <Tooltip.Panel>Remove Liquidity</Tooltip.Panel>
        </Tooltip> */}
        {/* <Tooltip>
          <Icon
            iconSrc='/icons/msic-swap-h.svg'
            size='smi'
            className='grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect'
            onClick={() => {
              routeTo('/swap', {
                queryProps: {
                  coin1: info.base,
                  coin2: info.quote,
                },
              })
            }}
          />
          <Tooltip.Panel>Swap</Tooltip.Panel>
        </Tooltip> */}
      </Row>
    </Row>
  )
}

export default function PoolsPage() {
  const pairInfos = createStorePropertySignal((s) => s.pairInfos)
  return (
    <DatabaseTable
      sectionTitle='Pools'
      items={pairInfos}
      renderCollapseItemFace={(item) => <PoolItemFace item={item} />}
      renderCollapseItemContent={(item) => <PoolItemContent item={item} />}
    />
  )
}
