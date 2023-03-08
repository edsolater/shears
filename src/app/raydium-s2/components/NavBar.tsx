import { Piv } from '@edsolater/piv'
import { Box, Image } from '@edsolater/pivkit'
import { Link } from '../uikit/Link'

export function NavBar(props: { barTitle?: string; onOpenMenu?: () => void }) {
  return <TopMenuBar />
}

/**
 * have navbar(route bar) toggle button and wallet connect button
 */
export function TopMenuBar(props: { barTitle?: string; onOpenMenu?: () => void }) {
  return (
    <Piv<'nav'>
      icss={{ userSelect: 'none', color: 'white', padding: '16px 48px', transition: '150ms' }}
      as={(parsedPivProps) => <nav {...parsedPivProps} />}
    >
      <Box icss={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href='/' innerRoute>
          <Image icss={{ cursor: 'pointer' }} src='/raydium-logo-with-text.svg' />
        </Link>

        {/* <Row className='gap-8 items-center'>
          <MessageBoardWidget />
          <WalletWidget />
        </Row> */}
      </Box>
    </Piv>
  )
}
