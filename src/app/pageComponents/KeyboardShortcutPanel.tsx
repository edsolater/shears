import { map } from "@edsolater/fnkit";
import {
  Box,
  InfiniteScrollList,
  Input,
  KeybordShortcutKeys,
  Text, createIncresingAccessor,
  cssColors, keyboardShortcutObserverPlugin,
  useShortcutsInfo,
  useShortcutsRegister
} from "@edsolater/pivkit";
import { useNavigate } from "@solidjs/router";
import { globalRouteShortcuts } from "../configs/globalShortcuts";
import { documentElement } from "../utils/documentElement";

/**
 *
 * COMPONENT
 * show current page valiable shortcut
 */

export function KeyboardShortcutPanel() {
  const navigate = useNavigate();
  const { shortcuts } = useShortcutsInfo(documentElement);
  const { updateShortcut } = useShortcutsRegister(
    documentElement,
    map(globalRouteShortcuts, ({ to, shortcut }) => ({
      shortcut,
      action: () => navigate(to),
    }))
  );

  // utils for update shortcut
  const updateSetting = (description: string, shortcut: KeybordShortcutKeys) => {
    updateShortcut(description, { shortcut });
  };
  const increasing = createIncresingAccessor({ eachTime: 2000 });
  return (
    <Box
      class={"keyboard-shortcut-panel"}
      icss={{
        //TODO: should be on by keyboard , temporary just hidden it!!
        visibility: "hidden",
        pointerEvents: "none",

        position: "fixed",
        bottom: 0,
        right: 0,
        border: "solid",
        padding: "4px",
        zIndex: 10,
        contain: "content",
        backdropFilter: "blur(2px) brightness(0.2)", // may cost performance
      }}
    >
      <InfiniteScrollList items={shortcuts()}>
        {({ description, shortcut }) => (
          <Box icss={{ display: "grid", gridTemplateColumns: "180px 200px", gap: "8px" }}>
            <Text icss={cssColors.labelColor}>{description}</Text>
            <Input
              value={String(shortcut)}
              icss={{ border: "solid" }}
              disableUserInput
              plugin={keyboardShortcutObserverPlugin({
                onRecordShortcut({ shortcut: newShortcut, el }) {
                  if (newShortcut !== shortcut) {
                    updateSetting(description, newShortcut);
                  }
                },
              })} />
          </Box>
        )}
      </InfiniteScrollList>
    </Box>
  );
}
