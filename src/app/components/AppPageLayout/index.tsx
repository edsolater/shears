import { KitProps, useKitProps } from '../../../packages/pivkit'
import { AppPageLayout_LayoutBoxProps, AppPageLayout_LayoutBox } from './LayoutBox'
import { AppPageLayout_NavBar } from './NavBar'

type AppPageLayoutProps = {
  metaTitle?: AppPageLayout_LayoutBoxProps['metaTitle']
}

export function AppPageLayout(kitProps: KitProps<AppPageLayoutProps>) {
  const { props, shadowProps } = useKitProps(kitProps)
  return (
    <AppPageLayout_LayoutBox
      metaTitle={props.metaTitle}
      shadowProps={shadowProps}
      renderTopBar={<AppPageLayout_NavBar />}
    >
      {props.children}
    </AppPageLayout_LayoutBox>
  )
}
