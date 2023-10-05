import { createEffect } from 'solid-js'
import { threeGridSlotBoxICSS } from '../icssBlocks/threeGridSlotBoxICSS'
import { Link } from './Link'
import { WalletWidget } from './WalletWidget'
import { Piv, parsePivProps, Box, Text } from '../../packages/pivkit'

export interface TopMenuBarProps {
  title?: string
}

/**
 * have navbar(route bar) toggle button and wallet connect button
 */

export function TopMenuBar(props: TopMenuBarProps) {
  useMetaTitle(() => props.title)
  return (
    <Piv<'nav'>
      icss={{ userSelect: 'none', padding: '16px 48px', transition: '150ms' }}
      render:self={(selfProps) => <nav {...parsePivProps(selfProps)} />}
    >
      <Box icss={threeGridSlotBoxICSS}>
        <Box icss={{ display: 'flex', gap: '64px' }}>
          <Text icss={{ fontSize: '36px', fontWeight: '800' }}>{props.title}</Text>
        </Box>

        {/* tabs */}
        <Box icss={{ display: 'flex', gap: '16px' }}>
          <Link href='/swap' innerRoute>
            Swap
          </Link>
          <Link href='/pools' innerRoute>
            Pools
          </Link>
          <Link href='/farms' innerRoute /* TODO: active style */>
            Farms
          </Link>
          <Link href='/playground' innerRoute>
            Playground
          </Link>
        </Box>

        <WalletWidget />
      </Box>
    </Piv>
  )
}

function useMetaTitle(title?: () => string | undefined) {
  createEffect(() => {
    if (globalThis.document && title?.()) Reflect.set(globalThis.document, 'title', `${title()} - shears`)
  })
}
