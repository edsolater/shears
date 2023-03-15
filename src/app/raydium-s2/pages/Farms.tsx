import { createEffect, Show } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Box, Collapse, CollapseFace, List } from '../../../packages/pivkit'
import { CoinAvatarPair } from '../components/CoinAvatarPair'
import { NavBar } from '../components/NavBar'
import { useFarmPageStates } from '../states/farmState'
import { useFarmStore } from '../stores/farms/store'
import { useTokenListStore } from '../stores/tokenList/store'
import { useTokenPriceStore } from '../stores/tokenPrice/store'

const icssSmoothBoxShadow =
  '0 1px 1px rgb(16 27 30 / 8%), 0 2px 2px rgb(16 27 30 / 8%), 0 4px 4px rgb(16 27 30 / 8%), 0 8px 8px rgb(16 27 30 / 8%), 0 16px 16px rgb(16 27 30 / 8%)'

export function FarmPage() {
  const farmStore = useFarmStore()
  const farmPageStates = useFarmPageStates()
  const tokenPriceStore = useTokenPriceStore()

  // createEffect(() => console.log('isFarmJsonsLoading', isFarmJsonsLoading()))
  createEffect(() => console.log('rokenPriceStore prices', tokenPriceStore.prices))
  createEffect(() => console.log('farmStore sdk', farmStore.farmSYNInfos))
  return (
    <Piv>
      <NavBar barTitle='Farms' />
      <FarmList />
    </Piv>
  )
}

function FarmList() {
  const farmStore = useFarmStore()
  const farmPageStates = useFarmPageStates()
  const tokenPriceStore = useTokenPriceStore()
  const tokenListStore = useTokenListStore()

  console.log('farmStore.farmJsonInfos: ', farmStore.farmJsonInfos)

  return (
    <List items={farmStore.farmSYNInfos}>
      {(info, idx) => (
        <Collapse icss={{ background: idx() % 2 ? '#eeee' : 'transparent' }}>
          <CollapseFace>
            {(status) => (
              <Box
                icss={{
                  display: 'grid',
                  gridTemplateColumns: '.3fr 1fr 1fr 1fr 1fr',
                  padding: 6,
                  borderRadius: 4
                }}
                onClick={() => {
                  farmPageStates.setDetailViewFarmId(info.id)
                }}
              >
                {/* part 1 */}
                <Box></Box>
                {/* part 2 */}
                <Box
                  icss={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <CoinAvatarPair
                    token1={tokenListStore.getToken(info.baseMint)}
                    token2={tokenListStore.getToken(info.quoteMint)}
                  />
                  <Piv>{info.name}</Piv>
                </Box>
                
                {/* part 3 */}
                <Piv>{info.category}</Piv>
                {/* <Show when={status.isOpen}>
                  <Piv>{info.version}</Piv>
                </Show> */}
              </Box>
            )}
          </CollapseFace>
          <Collapse.Content>
            <Piv>{info.name} farm's detail here</Piv>
          </Collapse.Content>
        </Collapse>
      )}
    </List>
  )
}
