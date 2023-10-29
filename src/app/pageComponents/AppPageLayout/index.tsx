import { KitProps, useKitProps } from '../../../packages/pivkit'
import { AppPageLayout_LayoutBoxProps, AppPageLayout_LayoutBox } from './LayoutBox'
import { AppPageLayout_NavBar } from './NavBar'
import { AppPageLayout_SideMenu } from './SideMenu'

type AppPageLayoutProps = {
  metaTitle?: AppPageLayout_LayoutBoxProps['metaTitle']
}

export function AppPageLayout(kitProps: KitProps<AppPageLayoutProps>) {
  const { props, shadowProps } = useKitProps(kitProps)
  return (
    <AppPageLayout_LayoutBox
      shadowProps={shadowProps}
      metaTitle={props.metaTitle}
      render:topBar={<AppPageLayout_NavBar />}
      render:sideBar={<AppPageLayout_SideMenu />}
    >
      {props.children}
    </AppPageLayout_LayoutBox>
  )
}
