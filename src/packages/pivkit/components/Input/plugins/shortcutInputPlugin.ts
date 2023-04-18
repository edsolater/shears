import { createPlugin } from "../../../../piv/propHandlers/plugin"
import { createControllerRef } from "../../../hooks/createControllerRef"
import { createRef } from "../../../hooks/createRef"
import { DrawerController } from "../../Drawer"
import { InputProps } from "../Input"

export const shortcutInputPlugin = createPlugin<InputProps>(() => {
  const [divRef, setDivRef] = createRef<HTMLDivElement>()
  const [drawerController, setControllerRef] = createControllerRef<DrawerController>()
  return { ref: setDivRef, controllerRef: setControllerRef } 
})