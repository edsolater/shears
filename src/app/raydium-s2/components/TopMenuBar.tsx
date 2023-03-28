import { createEffect } from 'solid-js'
import { Piv, PivProps } from '../../../packages/piv'
import { Box, Text } from '../../../packages/pivkit'
import { Link } from './Link'
import { threeGridSlotBoxICSS } from '../icssBlocks/threeGridSlotBoxICSS'
import { WalletWidget } from './WalletWidget'

export type TopMenuBarProps = {
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
      as={(parsedPivProps) => <nav {...parsedPivProps} />}
    >
      <Box icss={threeGridSlotBoxICSS}>
        <Box icss={{ display: 'flex', gap: 64 }}>
          <Text icss={{ fontSize: 36, fontWeight: 800 }}>{props.title}</Text>
        </Box>

        {/* tabs */}
        <Box icss={{ display: 'flex', gap: 16 }}>
          <Link href='/farms' innerRoute /* TODO: active style */>
            Farms
          </Link>
          <Link href='/pools' innerRoute>
            Pools
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
