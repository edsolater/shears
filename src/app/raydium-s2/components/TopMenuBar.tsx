import { Piv } from '@edsolater/piv'
import { Box, Image } from '@edsolater/pivkit'
import { Link } from './Link'
import { WalletWidget } from './WalletWidget';

/**
 * have navbar(route bar) toggle button and wallet connect button
 */

export function TopMenuBar(props: { barTitle?: string; onOpenMenu?: () => void }) {
  return (
    <Piv<'nav'>
      icss={{ userSelect: 'none',  padding: '16px 48px', transition: '150ms' }}
      as={(parsedPivProps) => <nav {...parsedPivProps} />}
    >
      <Box icss={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href='/' innerRoute>
          <Image icss={{ cursor: 'pointer' }} src='/raydium-logo-with-text.svg' />
        </Link>

        <WalletWidget />
        {/* <Row className='gap-8 items-center'>
              <MessageBoardWidget />
            </Row> */}
      </Box>
    </Piv>
  )
}
