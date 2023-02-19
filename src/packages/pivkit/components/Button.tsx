import { isArray, MayArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import { compressICSSToObj, ICSS, KitProps, mergeProps, Piv, useKitProps } from '@edsolater/piv'
import { CRef, PivProps } from '@edsolater/piv/src/types/piv'
import { JSX } from 'solid-js'
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
  /** a short cut for validator */
  disabled?: boolean
  /** normally, it's an icon  */
  prefix?: MayFn<JSX.Element, [utils: ButtonStatus]>
  /** normally, it's an icon  */
  suffix?: MayFn<JSX.Element, [utils: ButtonStatus]>
  clildren?: MayFn<JSX.Element, [utils: ButtonStatus]>
}>
/**
 * feat: build-in click ui effect
 */
export function Button(rawProps: ButtonProps) {
  /* ---------------------------------- props --------------------------------- */
  const themeProps = useGlobalKitTheme<ButtonProps>(Button.name)

  /* ------------------------------ detail props ------------------------------ */
  const [props, pivProps] = useKitProps(mergeProps(themeProps, rawProps))

  // const {
  //   mainColor = cssColors.buttonPrimaryColor,
  //   mainTextColor = variant === 'solid' ? 'white' : shrinkFn(mainColor, [mergedProps]),
  //   contentGap = 4,
  //   disableOpacity = 0.3,
  //   cssProps
  // } = theme ?? {}

  const [ref, setRef] = createRef<HTMLButtonElement>()

  const innerStatus = {
    click: () => {
      ref()?.click()
    },
    focus: () => {
      ref()?.focus()
    }
  }

  // useStatusRef(statusRef, innerStatus)

  const cssPadding = {
    lg: '14px 24px',
    md: '10px 16px',
    sm: '8px 16px',
    xs: '2px 6px'
  }['md']
  const cssFontSize = {
    lg: 16,
    md: 16,
    sm: 14,
    xs: 12
  }['md']
  const cssBorderRadius = {
    lg: 12,
    md: 8,
    sm: 8,
    xs: 4
  }['md']
  const cssOutlineWidth = {
    lg: 2,
    md: 2,
    sm: 1,
    xs: 0.5
  }['md']
  return (
    <Piv<'button'>
      shadowProps={pivProps}
      class={Button.name}
      as={(parsedPivProps) => <button {...parsedPivProps} />}
      onClick={(...args) => !props.disabled && props.onClick?.(...args)}
      htmlProps={{ type: 'button' }}
      icss={[
        { transition: `200ms ${cssTransitionTimeFnOutCubic}` }, // make it's change smooth
        { border: 'none' }, // initialize
        { color: 'white' }, // light mode
        {
          display: 'inline-flex',
          gap: 4,
          alignItems: 'center',
          justifyContent: 'center'
        }, // center the items
        {
          cursor: 'pointer',
          userSelect: 'none',
          width: 'max-content'
        },
        props.disabled && {
          opacity: 0.3,
          cursor: 'not-allowed'
        },
        {
          padding: cssPadding,
          fontSize: cssFontSize,
          borderRadius: cssBorderRadius,
          fontWeight: 500
        },
        {
          backgroundColor: cssColors.buttonPrimaryColor,
          ':hover': {
            filter: 'brightness(95%)'
          },
          ':active': {
            transform: 'scale(0.96)',
            filter: 'brightness(90%)'
          }
        }
      ]}
      ref={setRef}
    >
      {shrinkFn(props.prefix, [innerStatus])}
      {props.children}
      {shrinkFn(props.suffix, [innerStatus])}
    </Piv>
  )
}

/**
 * @todo TEMP, currently force it, should use NPM css color utils
 */
export function opacityCSSColor(cssColor: CSSColorString, /* 0~1 */ opacity: number) {
  return cssColor === cssColors.buttonPrimaryColor ? '#7c859826' /* 0.15 */ : `${cssColor}${opacity}` //TODO: temp
}
