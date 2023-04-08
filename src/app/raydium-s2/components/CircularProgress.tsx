import { createMemo } from 'solid-js'
import { KitProps, addDefaultProps, useKitProps } from '../../../packages/piv'
import { createRef } from '../../../packages/pivkit'

type CircularProgressProps = {
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

// TODO: should move to pivkit in future
export function CircularProgress(kitProps: KitProps<CircularProgressProps>) {
  const rawProps = useKitProps<CircularProgressProps>(kitProps)
  const props = addDefaultProps(rawProps, { svgWidth: 36, strokeWidth: 3, percent: 0.3 })
  const [ref, setRef] = createRef<SVGSVGElement>()

  const r = createMemo(() => (0.5 * props.svgWidth) / 2)
  const p = createMemo(() => 2 * r() * Math.PI)

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg
        ref={setRef}
        width={props.svgWidth}
        height={props.svgWidth}
        viewBox={`0 0 ${props.svgWidth} ${props.svgWidth}`}
      >
        <circle
          r={r()}
          cx='50%'
          cy='50%'
          fill='transparent'
          style={{ 'stroke-width': `${props.strokeWidth}px`, stroke: '#00000014' }}
        />
        <circle
          id='bar'
          r={r()}
          cx='50%'
          cy='50%'
          fill='transparent'
          stroke-dasharray={String(p())}
          stroke-dashoffset={p() - Math.min(props.percent, 1) * p()}
          style={{
            'stroke-width': `${props.strokeWidth}px`,
            stroke: 'currentcolor',
            transform: 'rotate(-90deg)',
            'transform-origin': 'center',
            'stroke-linecap': 'round'
          }}
        />
      </svg>
    </div>
  )
}
