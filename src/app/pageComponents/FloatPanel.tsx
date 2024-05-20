import type { ICSS, KitProps, PivChild, PivProps } from "@edsolater/pivkit"
import {
  Box,
  Piv,
  createDisclosure,
  createDomRef,
  cssOpacity,
  draggablePlugin,
  icssCardPanel,
  icssClickable,
  resizablePlugin,
  useKitProps,
} from "@edsolater/pivkit"
import { colors } from "../theme/colors"
import { Show, createEffect } from "solid-js"

export type FloatPanelProps = {
  thumbnailIcon?: PivChild
  content?: PivChild
  moveHandlerIcss?: ICSS
  panelIcss?: ICSS
}

export function FloatingInfoPanel(kitProps: KitProps<FloatPanelProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "FloatPanel" })
  const { dom: handler, setDom: setHandlerDom } = createDomRef()
  const [isOpened, { open, close, toggle }] = createDisclosure()
  return (
    <>
      <Piv // thumbnail
        icss={[
          {
            borderRadius: "999vw",
            width: "4em",
            height: "4em",
            background: "dodgerblue",
            color: "white",
            display: "grid",
            placeContent: "center",
            fontSize: "2em",
          },
          icssClickable,
        ]}
        onClick={() => toggle()}
      >
        open
      </Piv>
      <Show when={isOpened()}>
        <Box
          shadowProps={shadowProps}
          icss={[
            {
              color: "dodgerblue",
              position: "fixed",
              borderRadius: "16px",
              top: "40%",
              left: "40%",
            },
            icssCardPanel,
            props.panelIcss,
          ]}
          plugin={[
            draggablePlugin.config({ handlerElement: handler }),
            // resizablePlugin.config({
            //   canResizeX: true,
            //   canResizeY: true,
            // }),
          ]}
        >
          <DragHandler domRef={setHandlerDom} icss={props.moveHandlerIcss} />
          <Box>{props.content ?? props.children}</Box>
        </Box>
      </Show>
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
