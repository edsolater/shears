import { KitProps, useKitProps, Box } from "@edsolater/pivkit"
import { createMemo } from "solid-js"

interface CircularProgressBarRawProps {
  /** like animation run */
  run?: boolean
  /**
   * when this props change, restartCircle manually
   */
  // componentRef?: RefObject<any>
  percent?: number
  // duration?: number
  strokeWidth?: string | number
  // updateDelay?: number
  svgWidth?: number
}

type CircleProgressBarProps = KitProps<CircularProgressBarRawProps>

// TODO: should move to pivkit in future
export function CircularProgressBar(kitProps: CircleProgressBarProps) {
  const { props, shadowProps } = useKitProps(kitProps, { defaultProps: { svgWidth: 36, strokeWidth: 3, percent: 0.3 } })
  const r = createMemo(() => (0.5 * props.svgWidth) / 2)
  const p = createMemo(() => 2 * r() * Math.PI)

  return (
    <Box shadowProps={shadowProps} style={{ width: "100%", height: "100%" }}>
      <svg width={props.svgWidth} height={props.svgWidth} viewBox={`0 0 ${props.svgWidth} ${props.svgWidth}`}>
        <circle
          id="track"
          r={r()}
          cx="50%"
          cy="50%"
          fill="transparent"
          style={{
            "stroke-width": `${props.strokeWidth}px`,
            stroke: "currentcolor",
            opacity: 0.1,
            "transform-origin": "center",
            "stroke-linecap": "round",
          }}
        />
        <circle
          id="bar"
          r={r()}
          cx="50%"
          cy="50%"
          fill="transparent"
          style={{
            "stroke-width": `${props.strokeWidth}px`,
            "stroke-dasharray": String(p()),
            "stroke-dashoffset": String(p() - Math.min(props.percent, 1) * p()),
            stroke: "currentcolor",
            transform: "rotate(-90deg)",
            "transform-origin": "center",
            "stroke-linecap": "round",
          }}
        />
      </svg>
    </Box>
  )
}
