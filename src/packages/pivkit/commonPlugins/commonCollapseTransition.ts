import { createPlugin } from '../../piv/propHandlers/plugin'

type Options = {}

export const commonCollapseTransition = createPlugin<Options>((props) => {
  // TODO collapse transition should just an plugin so every pivkit can use it
  return { dangerousRenderWrapperNode: (node) => node }
})


