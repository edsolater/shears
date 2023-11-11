import { Subscribable } from './core'

type EffectExcuter = () => void

const subscribedExcuters: EffectExcuter[] = []
const subscribedExcutersSymbol = Symbol('subscribedExcuters')

interface HaveSubscribeExcuter {
  [subscribedExcutersSymbol]: Set<EffectExcuter>
}

function handleSubscribableEffectExcuter(
  onGet: (registedCallback: () => void) => void,
  onChangeValue: (registedCallback: (newValue: unknown, oldValue: unknown) => void) => void,
  subscribe: Subscribable<unknown>['subscribe'],
) {
  onGet(() => {})
}
