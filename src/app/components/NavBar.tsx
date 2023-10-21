import { Box } from '../../packages/pivkit'
import { threeGridSlotBoxICSS } from '../icssBlocks/threeGridSlotBoxICSS'
import { NavWrapBox, NavWrapBoxProps } from './NavWrapBox'
import { RoutesButtons } from './RoutesButtons'
import { AppLogo } from './AppLogo'
import { WalletWidget } from './WalletWidget'

export type NavBarProps = NavWrapBoxProps

export function NavBar(props: NavBarProps) {
  return (
    <NavWrapBox title={props.title}>
      <Box icss={threeGridSlotBoxICSS}>
        <AppLogo title={props.title}></AppLogo>

        {/* tabs */}
        <RoutesButtons />

        <WalletWidget />
      </Box>
    </NavWrapBox>
  )
}
