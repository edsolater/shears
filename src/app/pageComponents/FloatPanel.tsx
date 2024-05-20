import type { ICSS, KitProps, PivChild, PivProps } from "@edsolater/pivkit"
import {
  Box,
  Piv,
  createDisclosure,
  createDomRef,
  cssOpacity,
  draggablePlugin,
  icssCardPanel,
  resizablePlugin,
  useKitProps,
} from "@edsolater/pivkit"
import { colors } from "../theme/colors"

export type FloatPanelProps = {
  thumbnailIcon?: PivChild
  content?: PivChild
  moveHandlerIcss?: ICSS
  panelIcss?: ICSS
}

export function FloatingInfoPanel(kitProps: KitProps<FloatPanelProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "FloatPanel" })
  const { dom: handler, setDom: setHandlerDom } = createDomRef()
  const [isOpened, { open, close }] = createDisclosure()
  return (
    <>
      <Piv // thumbnail
        icss={{
          borderRadius: "999vw",
          width: "8px",
          height: "8px",
          background: "dodgerblue",
          color: "white",
          display: "grid",
          placeContent: "center",
        }}
      >
        Pa
      </Piv>
      <Box
        shadowProps={shadowProps}
        icss={[
          {
            color: "dodgerblue",
            position: "fixed",
            borderRadius: "16px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
          icssCardPanel,
          props.panelIcss,
        ]}
        plugin={[
          draggablePlugin.config({ handlerElement: handler }),
          resizablePlugin.config({
            canResizeX: true,
            canResizeY: true,
          }),
        ]}
      >
        <DragHandler domRef={setHandlerDom} icss={props.moveHandlerIcss} />
        <Box>{props.content ?? props.children}</Box>
      </Box>
    </>
  )
}

function DragHandler(additionProps: PivProps) {
  return (
    <Piv // Drag Handler
      shadowProps={additionProps}
      icss={{
        position: "absolute",
        left: "50%",
        top: "8px",
        transform: "translateX(-50%)",

        width: "40px",
        height: "6px",
        backgroundColor: `${cssOpacity(colors.textPrimary, 0.4)}`,

        // backgroundClip:'content-box',
        borderRadius: "999px",

        "&::before": {
          content: "''",
          position: "absolute",
          inset: "-1em",
          background: "transparent",
          borderRadius: "inherit",
        },
      }}
    />
  )
}
