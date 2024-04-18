import { KitProps, createComponentContext, useKitProps } from "@edsolater/pivkit"
import { type Accessor } from "solid-js"
import { useMetaTitle } from "../../hooks/useMetaTitle"
import { AppMentor_LayoutBox, AppMentor_LayoutBoxProps } from "./LayoutBox"
import { AppMentor_NavBar } from "./NavBar"
import { NavSideMenu } from "./SideMenu"

type AppMentorProps = {
  metaTitle?: AppMentor_LayoutBoxProps["metaTitle"]
}

export const AppMentorContext = createComponentContext<{
  isSideMenuOpen?: Accessor<boolean>
  isSideMenuFloating?: Accessor<boolean>
  toggleSideMenu?: () => void
}>()

export function AppMentor(kitProps: KitProps<AppMentorProps>) {
  const { props, shadowProps } = useKitProps(kitProps)

  // app layout context

  useMetaTitle(() => props.metaTitle)

  return (
    <AppMentorContext.Provider value={{}}>
      <AppMentor_LayoutBox
        shadowProps={shadowProps}
        metaTitle={props.metaTitle}
        Topbar={<AppMentor_NavBar />}
        Sidebar={<NavSideMenu />}
      >
        {props.children}
      </AppMentor_LayoutBox>
    </AppMentorContext.Provider>
  )
}
