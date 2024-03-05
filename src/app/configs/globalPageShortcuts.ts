import { KeybordShortcutKeys } from "@edsolater/pivkit"
import { farmsRoutePath, homeRoutePath, poolsRoutePath, swapRoutePath } from "../routes"

export const globalPageShortcuts = {
  "go to home": {
    shortcut: "alt + /",
    to: homeRoutePath,
  },
  "go to swap": {
    shortcut: "alt + s",
    to: swapRoutePath,
  },
  "go to pools": {
    shortcut: "alt + p",
    to: poolsRoutePath,
  },
  "go to farms": {
    shortcut: "alt + f",
    to: farmsRoutePath,
  },
} satisfies Record<string, { to: string; shortcut: KeybordShortcutKeys }>
