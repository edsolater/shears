import { map } from "@edsolater/fnkit"
import {
  Box,
  InfiniteScrollList,
  Input,
  KeybordShortcutKeys,
  Piv,
  Text,
  createIncresingAccessor,
  cssColors,
  keyboardShortcutObserverPlugin,
  useShortcutsInfo,
  useShortcutsRegister,
} from "@edsolater/pivkit"
import { useNavigate } from "@solidjs/router"
import { globalRouteShortcuts } from "../configs/globalShortcuts"
import { documentElement } from "../utils/documentElement"
import { FloatingInfoPanel } from "./FloatPanel"
import { Icon } from "@edsolater/pivkit"
import { colors } from "../theme/colors"

/**
 *
 * COMPONENT
 * show current page valiable shortcut
 */

export function KeyboardShortcutPanel() {
  const navigate = useNavigate()
  const { shortcuts } = useShortcutsInfo(documentElement)
  const { updateShortcut } = useShortcutsRegister(
    documentElement,
    map(globalRouteShortcuts, ({ to, shortcut }) => ({
      shortcut,
      action: () => navigate(to),
    })),
  )

  // utils for update shortcut
  const updateSetting = (description: string, shortcut: KeybordShortcutKeys) => {
    updateShortcut(description, { shortcut })
  }
  const increasing = createIncresingAccessor({ eachTime: 2000 })
  return (
    <FloatingInfoPanel
      thumbnailIcon={
        <Piv // thumbnail
          icss={{
            borderRadius: "999vw",
            width: "1.5em",
            height: "1.5em",
            background: colors.buttonPrimary,
            color: "white",
            display: "grid",
            placeContent: "center",
            fontSize: "2em",
          }}
        >
          <Icon src={"/icons/keyboard.svg"}></Icon>
        </Piv>
      }
      panelIcss={{
        color: colors.textPrimary,
        position: "fixed",
        borderRadius: "16px",
        top: "40%",
        left: "40%",
      }}
      content={
        <Box
          class={"keyboard-shortcut-panel"}
          icss={{
            //TODO: should be on by keyboard , temporary just hidden it!!
            padding: "4px",
            zIndex: 10,
            contain: "content",
          }}
        >
          <InfiniteScrollList items={shortcuts()}>
            {({ description, shortcut }) => (
              <Box icss={{ display: "grid", gridTemplateColumns: "180px 200px", gap: "8px" }}>
                <Text icss={cssColors.labelColor}>{description}</Text>
                <Input
                  value={String(shortcut)}
                  disableUserInput
                  plugin={keyboardShortcutObserverPlugin({
                    onRecordShortcut({ shortcut: newShortcut, el }) {
                      if (newShortcut !== shortcut) {
                        updateSetting(description, newShortcut)
                      }
                    },
                  })}
                />
              </Box>
            )}
          </InfiniteScrollList>
        </Box>
      }
    ></FloatingInfoPanel>
  )
}
