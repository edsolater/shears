import { KitProps, useKitProps } from '../../../packages/pivkit'
import { useMetaTitle } from '../../hooks/useMetaTitle'
import { AppPageLayout_LayoutBoxProps, AppPageLayout_LayoutBox } from './LayoutBox'
import { AppPageLayout_NavBar } from './NavBar'
import { NavSideMenu } from './SideMenu'

type AppPageLayoutProps = {
  metaTitle?: AppPageLayout_LayoutBoxProps['metaTitle']
}

export function AppPageLayout(kitProps: KitProps<AppPageLayoutProps>) {
  const { props, shadowProps } = useKitProps(kitProps)

  useMetaTitle(() => props.metaTitle)
  return (
    <AppPageLayout_LayoutBox
      shadowProps={shadowProps}
      metaTitle={props.metaTitle}
      render:topBar={<AppPageLayout_NavBar />}
      render:sideBar={<NavSideMenu />}
    >
      {props.children}
    </AppPageLayout_LayoutBox>
  )
}
