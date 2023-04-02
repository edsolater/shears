import { createPlugin } from '../../piv/propHandlers/plugin'
import { PivProps } from '../../piv/types/piv'

type Options = {}

export const commonCollapseTransition = createPlugin<PivProps & Options>((props) => {
  // TODO collapse transition should just an plugin so every pivkit can use it
  return { dangerousRenderWrapperNode: (node) => node }
})
