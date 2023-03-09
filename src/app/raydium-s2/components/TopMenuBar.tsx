import { Piv } from '@edsolater/piv'
import { Box, Image, Text } from '@edsolater/pivkit'
import { Show } from 'solid-js'
import { Link } from './Link'
import { WalletWidget } from './WalletWidget'

export type TopMenuBarProps = {
  browserTabTitle?: string
  barTitle?: string
  onOpenMenu?: () => void
}

/**
 * have navbar(route bar) toggle button and wallet connect button
 */

export function TopMenuBar(props: TopMenuBarProps) {
  return (
    <Piv<'nav'>
      icss={{ userSelect: 'none', padding: '16px 48px', transition: '150ms' }}
      as={(parsedPivProps) => <nav {...parsedPivProps} />}
    >
      <Box icss={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box icss={{ display: 'flex', gap: 64 }}>
          <Link href='/' innerRoute>
            <Image icss={{ cursor: 'pointer' }} src='/raydium-logo-with-text.svg' />
          </Link>
          <Show when={props.barTitle}>
            <Text icss={{ fontSize: 24, fontWeight: 500 }}>{props.barTitle}</Text>
          </Show>
        </Box>

        {/* tabs */}
        <Box icss={{ display: 'flex', gap: 16 }}>
          <Link href='/farms' innerRoute /* TODO: active style */>
            Farms
          </Link>
          <Link href='/pools' innerRoute>
            Pools
          </Link>
        </Box>

        <WalletWidget />
      </Box>
    </Piv>
  )
}
