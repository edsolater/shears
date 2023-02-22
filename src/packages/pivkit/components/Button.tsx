import { flap, isValuedArray, MayArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import {
  compressICSSToObj,
  CRef,
  gettersProps,
  ICSS,
  KitProps,
  mergeSignalProps,
  Piv,
  SignalizeProps,
  signalizeProps,
  useKitProps
} from '@edsolater/piv'
import { createMemo, JSX } from 'solid-js'
import { createRef } from '../hooks/createRef'
import { useGlobalKitTheme } from '../hooks/useGlobalKitTheme'
import { useStatusRef } from '../hooks/useStatusRef'
import { cssColors } from '../styles/cssColors'
import { CSSColorString, CSSStyle } from '../styles/type'
type BooleanLike = unknown

export interface ButtonStatus {
  click?: () => void
  focus?: () => void
}

const cssTransitionTimeFnOutCubic = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

export type ButtonProps = KitProps<{
  /**
   * @default 'solid'
   */
  variant?: 'solid' | 'outline' | 'text'
  /**
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /**
   * !only for app's uikit <Button>
   * button's mean  color (apply to all variant of button)
   * default {@link cssColors.buttonPrimaryColor } when in darkMode
   */
  theme?: {
    mainColor?: MayFn<CSSColorString, [props: SignalizeProps<Omit<ButtonProps, 'theme' | 'validators'>>]>
    mainTextColor?: MayFn<CSSColorString, [props: SignalizeProps<Omit<ButtonProps, 'theme' | 'validators'>>]>
    contentGap?: MayFn<CSSStyle['gap'], [props: SignalizeProps<Omit<ButtonProps, 'theme' | 'validators'>>]>
    disableOpacity?: MayFn<CSSStyle['opacity'], [props: SignalizeProps<Omit<ButtonProps, 'theme' | 'validators'>>]>
    cssProps?: MayFn<ICSS, [props: SignalizeProps<Omit<ButtonProps, 'theme' | 'validators'>>]>
  }
  /** a short cut for validator */
  disabled?: boolean
  /** must all condition passed */
  validators?: MayArray<{
    /** must return true to pass this validator */
    should: MayFn<BooleanLike>
    // used in "connect wallet" button, it's order is over props: disabled
    forceActive?: boolean
    /**  items are button's setting which will apply when corresponding validator has failed */
    fallbackProps?: SignalizeProps<Omit<ButtonProps, 'validators' | 'disabled'>>
  }>
  /** normally, it's an icon  */
  prefix?: MayFn<JSX.Element, [utils: ButtonStatus]>
  /** normally, it's an icon  */
  suffix?: MayFn<JSX.Element, [utils: ButtonStatus]>
  statusRef?: CRef<ButtonStatus>
  clildren?: MayFn<JSX.Element, [utils: ButtonStatus]>
}>

/**
 * feat: build-in click ui effect
 */
export function Button(rawProps: ButtonProps) {
  /* ---------------------------------- props --------------------------------- */
  const { validators, ...normalProps } = signalizeProps(rawProps, {
    defaultProps: [{ variant: 'solid', size: 'md' } satisfies ButtonProps, useGlobalKitTheme<ButtonProps>('Button')]
  })

  /* ------------------------------- validation ------------------------------- */
  const failedTestValidator = createMemo(() =>
    isValuedArray(validators()) || validators()
      ? flap(validators()!).find(({ should }) => !shrinkFn(should))
      : undefined
  )

  const mergedProps = mergeSignalProps(normalProps, failedTestValidator()?.fallbackProps)

  const isActive = createMemo(
    () => failedTestValidator()?.forceActive || (!failedTestValidator() && !mergedProps.disabled())
  )

  const isDisabled = () => !isActive()

  /* ------------------------------ detail props ------------------------------ */
  const props = useKitProps(mergedProps) // FIXME logic is bug, because pivPorps also export Button's props
  const pivProps = props

  const {
    mainColor = cssColors.buttonPrimaryColor,
    mainTextColor = props.variant() === 'solid' ? 'white' : shrinkFn(mainColor, [mergedProps]),
    contentGap = 4,
    disableOpacity = 0.3,
    cssProps
  } = props.theme() ?? {}

  const [ref, setRef] = createRef<HTMLButtonElement>()

  const innerStatus = {
    click: () => {
      ref()?.click()
    },
    focus: () => {
      ref()?.focus()
    }
  }

  useStatusRef(props.statusRef, innerStatus)

  const cssPadding = {
    lg: '14px 24px',
    md: '10px 16px',
    sm: '8px 16px',
    xs: '2px 6px'
  }[props.size()]
  const cssFontSize = {
    lg: 16,
    md: 16,
    sm: 14,
    xs: 12
  }[props.size()]
  const cssBorderRadius = {
    lg: 12,
    md: 8,
    sm: 8,
    xs: 4
  }[props.size()]
  const cssOutlineWidth = {
    lg: 2,
    md: 2,
    sm: 1,
    xs: 0.5
  }[props.size()]
  return (
    <Piv<'button'>
      class={Button.name}
      as={(parsedPivProps) => <button {...parsedPivProps} />}
      shadowProps={gettersProps(pivProps)}
      onClick={(...args) => !isDisabled && props.onClick()?.(...args)}
      htmlProps={{ type: 'button' }}
      icss={[
        { transition: `50ms ${cssTransitionTimeFnOutCubic}` }, // make it's change smooth
        { border: 'none' }, // initialize
        { color: shrinkFn(mainTextColor, [mergedProps]) }, // light mode
        {
          display: 'inline-flex',
          gap: shrinkFn(contentGap, [mergedProps]),
          alignItems: 'center',
          justifyContent: 'center'
        }, // center the items
        {
          cursor: 'pointer',
          userSelect: 'none',
          width: 'max-content'
        },
        isDisabled() && {
          opacity: shrinkFn(disableOpacity, [mergedProps]),
          cursor: 'not-allowed'
        },
        {
          padding: cssPadding,
          fontSize: cssFontSize,
          borderRadius: cssBorderRadius,
          fontWeight: 500
        },
        (!props.variant() || props.variant() === 'solid') && {
          backgroundColor: shrinkFn(mainColor, [mergedProps]),
          ':hover': {
            filter: 'brightness(95%)'
          },
          ':active': {
            transform: 'scale(0.98)',
            filter: 'brightness(90%)'
          }
        },
        props.variant() === 'outline' && {
          background: cssColors.transparent,
          outline: `${cssOutlineWidth} solid ${mainColor}`,
          outlineOffset: `-${cssOutlineWidth}`
        },
        props.variant() === 'text' && {
          ':hover': {
            backgroundColor: opacityCSSColor(shrinkFn(mainColor, [mergedProps]), 0.15)
          }
        },
        compressICSSToObj(shrinkFn(cssProps, [mergedProps]))
      ]}
      ref={setRef}
    >
      {shrinkFn(props.prefix(), [innerStatus])}
      {props.children()}
      {shrinkFn(props.suffix(), [innerStatus])}
    </Piv>
  )
}

/**
 * @todo TEMP, currently force it, should use NPM css color utils
 */
export function opacityCSSColor(cssColor: CSSColorString, /* 0~1 */ opacity: number) {
  return cssColor === cssColors.buttonPrimaryColor ? '#7c859826' /* 0.15 */ : `${cssColor}${opacity}` //TODO: temp
}
