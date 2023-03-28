import { createEffect } from 'solid-js'
import { Piv, PivProps } from '../../../packages/piv'
import { Box, Text } from '../../../packages/pivkit'
import { Link } from './Link'
import { WalletWidget } from './WalletWidget'

export type TopMenuBarProps = {
  title?: string
}

/**
 * have navbar(route bar) toggle button and wallet connect button
 */

export function TopMenuBar(props: TopMenuBarProps) {
  createEffect(() => {
    if (globalThis.document && props.title) Reflect.set(globalThis.document, 'title', `${props.title} - shears`)
  })
  return (
    <Piv<'nav'>
      icss={{ userSelect: 'none', padding: '16px 48px', transition: '150ms' }}
      as={(parsedPivProps) => <nav {...parsedPivProps} />}
    >
      <ThreeGridSlotBox>
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
      </ThreeGridSlotBox>
    </Piv>
  )
}
// TODO: it should be just a icss block 
function ThreeGridSlotBox(props: { children?: PivProps['children'] }) {
  return (
    <Box
      icss={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        alignItems: 'center',
        '& > :nth-child(1)': { justifySelf: 'start' },
        '& > :nth-child(2)': { justifySelf: 'center' },
        '& > :nth-child(3)': { justifySelf: 'end' }
      }}
    >
      {props.children}
    </Box>
  )
}
