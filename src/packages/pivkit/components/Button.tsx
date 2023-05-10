import { flap, isValuedArray, MayArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import { createMemo, JSX } from 'solid-js'
import { objectMerge } from '../../fnkit/objectMerge'
import { addDefaultProps, mergeProps } from '../../piv'
import { KitProps, useKitProps } from '../../piv/createKit'
import { Piv } from '../../piv/Piv'
import { applyPivController } from '../../piv/propHandlers/controller'
import { compressICSSToObj, ICSS } from '../../piv/propHandlers/icss'
import { omit } from '../../piv/utils/omit'
import { createRef } from '../hooks/createRef'
import { useGlobalKitTheme } from '../hooks/useGlobalKitTheme'
import { cssColors } from '../styles/cssColors'
import { CSSColorString, CSSStyle } from '../styles/type'
type BooleanLike = unknown

export type ButtonController = Readonly<{
  click?: () => void
  focus?: () => void
}>

const cssTransitionTimeFnOutCubic = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

export type ButtonProps = {
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
   * default {@link cssColors.button_bg_primary } when in darkMode
   */
  theme?: {
    mainBgColor?: MayFn<CSSColorString, [props: Omit<ButtonProps, 'theme' | 'validators'>]>
    mainTextColor?: MayFn<CSSColorString, [props: Omit<ButtonProps, 'theme' | 'validators'>]>
    contentGap?: MayFn<CSSStyle['gap'], [props: Omit<ButtonProps, 'theme' | 'validators'>]>
    disableOpacity?: MayFn<CSSStyle['opacity'], [props: Omit<ButtonProps, 'theme' | 'validators'>]>
    cssProps?: MayFn<ICSS, [props: Omit<ButtonProps, 'theme' | 'validators'>]>
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
    fallbackProps?: Omit<ButtonProps, 'validators' | 'disabled'>
  }>
  /** normally, it's an icon  */
  prefix?: JSX.Element
  /** normally, it's an icon  */
  suffix?: JSX.Element
}

/**
 * feat: build-in click ui effect
 */
export function Button(kitProps: KitProps<ButtonProps, { controller: ButtonController }>) {
  const innerController: ButtonController = {
    click: () => {
      ref()?.click()
    },
    focus: () => {
      ref()?.focus()
    }
  }
  /* ---------------------------------- props --------------------------------- */
  const rawProps = useKitProps<ButtonProps>(kitProps, {
    controller: () => innerController
  })

  const props = addDefaultProps(
    rawProps,
    mergeProps({ variant: 'solid', size: 'md' }, useGlobalKitTheme<Partial<ButtonProps>>('Button'))
  )

  /* ------------------------------- validation ------------------------------- */
  const failedTestValidator = createMemo(() =>
    isValuedArray(props.validators) || props.validators
      ? flap(props.validators!).find(({ should }) => !shrinkFn(should))
      : undefined
  )
  const mergedProps = mergeProps(props, failedTestValidator()?.fallbackProps)

  const isActive = createMemo(
    () => failedTestValidator()?.forceActive || (!failedTestValidator() && !mergedProps.disabled)
  )

  const mainBgColor = props.theme?.mainBgColor ?? cssColors.button_bg_primary
  const mainTextColor = props.theme?.mainTextColor ?? cssColors.button_text_primary
  const contentGap = props.theme?.contentGap ?? 4
  const disableOpacity = props.theme?.disableOpacity ?? 0.3
  const cssProps = props.theme?.cssProps

  const [ref, setRef] = createRef<HTMLButtonElement>()

  const size = props.size
  const cssPadding = {
    lg: '14px 24px',
    md: '10px 16px',
    sm: '8px 16px',
    xs: '2px 6px'
  }[size]
  const cssFontSize = {
    lg: 16,
    md: 16,
    sm: 14,
    xs: 12
  }[size]
  const cssBorderRadius = {
    lg: 12,
    md: 8,
    sm: 8,
    xs: 4
  }[size]
  const cssOutlineWidth = {
    lg: 2,
    md: 2,
    sm: 1,
    xs: 0.5
  }[size]

  const mergedController =
    'inputController' in props ? objectMerge(props.inputController!, innerController) : innerController
  return (
    <Piv<'button'>
      class={Button.name}
      as={(parsedPivProps) => <button {...parsedPivProps} />}
      shadowProps={omit(props, 'onClick')} // omit onClick for need to invoke the function manually, see below 👇
      onClick={(...args) => isActive() && props.onClick?.(...args)}
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
        !isActive() && {
          opacity: shrinkFn(disableOpacity, [mergedProps]),
          cursor: 'not-allowed'
        },
        {
          padding: cssPadding,
          fontSize: cssFontSize,
          borderRadius: cssBorderRadius,
          fontWeight: 500
        },
        (!props.variant || props.variant === 'solid') && {
          backgroundColor: shrinkFn(mainBgColor, [mergedProps]),
          ':hover': {
            filter: 'brightness(95%)'
          },
          ':active': {
            transform: 'scale(0.98)',
            filter: 'brightness(90%)'
          }
        },
        props.variant === 'outline' && {
          background: cssColors.transparent,
          outline: `${cssOutlineWidth} solid ${mainBgColor}`,
          outlineOffset: `-${cssOutlineWidth}`
        },
        props.variant === 'text' && {
          ':hover': {
            backgroundColor: opacityCSSColor(shrinkFn(mainBgColor, [mergedProps]), 0.15)
          }
        },
        compressICSSToObj(shrinkFn(cssProps, [mergedProps]))
      ]}
      ref={setRef}
    >
      {props.prefix}
      {/* TODO: no need. this is because kitProp don't support Access and Deaccess */}
      {applyPivController(props.children, mergedController)}
      {props.suffix}
    </Piv>
  )
}

/**
 * @todo TEMP, currently force it, should use NPM css color utils
 */
export function opacityCSSColor(cssColor: CSSColorString, /* 0~1 */ opacity: number) {
  return cssColor === cssColors.button_bg_primary ? '#7c859826' /* 0.15 */ : `${cssColor}${opacity}` //TODO: temp
}
