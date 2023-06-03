import { For, Show } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Box, Collapse, CollapseFace, List } from '../../../packages/pivkit'
import { TokenAvatar } from '../components/TokenAvatar'
import { TokenAvatarPair } from '../components/TokenAvatarPair'
import { NavBar } from '../components/NavBar'
import { useFarmPageStates } from '../pageStates/farmState'
import { getToken } from '../stores/data/methods/getToken'
import { useDataStore } from '../stores/data/store'
import { toString } from '../utils/dataStructures/basicMath/format'
import { add } from '../utils/dataStructures/basicMath/operations'

const icssSmoothBoxShadow =
  '0 1px 1px rgb(16 27 30 / 8%), 0 2px 2px rgb(16 27 30 / 8%), 0 4px 4px rgb(16 27 30 / 8%), 0 8px 8px rgb(16 27 30 / 8%), 0 16px 16px rgb(16 27 30 / 8%)'

export default function FarmPage() {
  return (
    <Piv>
      <NavBar title='Farms' />
      <FarmList />
    </Piv>
  )
}

function FarmList() {
  const dataStore = useDataStore()
  const farmPageStates = useFarmPageStates()

  return (
    <List items={dataStore.farmInfos}>
      {(info, idx) => (
        <Collapse icss={{ background: idx() % 2 ? '#eeee' : 'transparent' }}>
          <CollapseFace>
            {(controller) => (
              <Box
                icss={{
                  display: 'grid',
                  gridTemplateColumns: '.3fr 1fr 1fr 1fr 1fr',
                  padding: 6,
                  borderRadius: 4,
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
                    gap: 8,
                  }}
                >
                  <TokenAvatarPair token1={getToken(info.base)} token2={getToken(info.quote)} />
                  {/* <Piv>{info.name}</Piv> */}
                </Box>

                {/* part 3 : pending reward*/}
                <Piv>
                  <For each={info.rewards}>{(r) => <TokenAvatar token={getToken(r.token)} />}</For>
                </Piv>

                {/* part 4 total apr */}
                <Piv>{toString(info.rewards.map((r) => r.apr?.['24h']).reduce((acc, r) => add(acc, r), 0))}</Piv>

                {/* part 5 tvl */}
                <Piv>{toString(info.tvl)}</Piv>

                {/* <Show when={controller.isOpen}>
                    <Piv>{info.version}</Piv>
                  </Show> */}
              </Box>
            )}
          </CollapseFace>
          <Collapse.Content>
            <Piv>
              <Piv>state: {info.hasLoad.join(' ')}</Piv>
              <Show when={info.userStakedLpAmount}>
                <Piv>deposited: {toString(info.userStakedLpAmount?.amount)}</Piv>
                <Piv>to havest: {toString(info.userStakedLpAmount?.amount)}</Piv>
              </Show>
            </Piv>
          </Collapse.Content>
        </Collapse>
      )}
    </List>
  )
}
