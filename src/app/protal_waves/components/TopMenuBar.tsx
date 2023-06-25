import { createEffect } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Box, Icon, Text, icss_row } from '../../../packages/pivkit'
import { threeGridSlotBoxICSS } from '../icssBlocks/threeGridSlotBoxICSS'
import { Link } from './Link'
import { parsePivProps } from '../../../packages/piv'

export interface TopMenuBarProps {
  title?: string
}

/**
 * have navbar(route bar) toggle button and wallet connect button
 */

export function TopMenuBar(props: TopMenuBarProps) {
  useHTMLDocumentMetaTitle(() => props.title)
  return (
    <Piv<'nav'>
      icss={[
        icss_row({ items: 'center' }),
        { userSelect: 'none', padding: '16px 32px', transition: '150ms' },
        threeGridSlotBoxICSS,
      ]}
      render:self={(selfProps) => <nav {...parsePivProps(selfProps)} />}
    >
      <Box icss={icss_row({ gap: 32 })}>
        <Link href='/' innerRoute>
          <Icon src='/logo-with-text.svg' icss={{ height: '32px' }} />
        </Link>
        {/* <Text icss={{ fontSize: 36, fontWeight: 800 }}>{props.title}</Text> */}
      </Box>

      {/* tabs */}
      <Box icss={{ display: 'flex', gap: 16 }}>
        <Link href='/' innerRoute>
          Home
        </Link>
        <Link href='/playground' innerRoute>
          Playground
        </Link>
      </Box>
    </Piv>
  )
}

function useHTMLDocumentMetaTitle(title?: () => string | undefined) {
  createEffect(() => {
    if (globalThis.document && title?.()) Reflect.set(globalThis.document, 'title', `${title()} - shears`)
  })
}
