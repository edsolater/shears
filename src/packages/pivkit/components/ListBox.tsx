import { MayFn, shrinkFn } from "@edsolater/fnkit"
import { For, JSXElement, createMemo, type Accessor } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { createRef } from "../hooks/createRef"
import { AddProps, PivChild, parsePivChildren } from "../piv"
import { Box } from "./Boxes"
import { Fragnment } from "@edsolater/pivkit"

export interface ListBoxController {}

export type ListBoxProps<T> = {
  of?: MayFn<Iterable<T>>
  children(item: T, index: Accessor<number>): PivChild
  Divider?: MayFn<PivChild, [payload: { prevIndex: Accessor<number>; currentIndex: Accessor<number> }]>
}

export type ListBoxKitProps<T> = KitProps<ListBoxProps<T>, { controller: ListBoxController }>

/**
 * a `<Box>` which contains a list of items
 * also a `<Loop>`
 * this component is for styling easier(such as divider between items)
 */
export function ListBox<T>(kitProps: ListBoxKitProps<T>) {
  const { props, shadowProps } = useKitProps(kitProps, {
    name: "ListBox",
    noNeedDeAccessifyChildren: true,
  })

  // [configs]
  const allItems = createMemo(() => Array.from(shrinkFn(props.of ?? []) as T[]))
  const itemLength = () => allItems().length

  // [listBox ref]
  const [listBoxRef, setRef] = createRef<HTMLElement>()

  return (
    <Box domRef={setRef} shadowProps={shadowProps}>
      <For each={allItems()}>
        {(item, idx) => (
          <Fragnment>
            <Box class="list-item">{parsePivChildren(props.children(item, idx))}</Box>
            {idx() < itemLength() - 1 &&
              "Divider" in kitProps &&
              parsePivChildren(shrinkFn(kitProps.Divider, [{ prevIndex: idx, currentIndex: () => idx() + 1 }]))}
          </Fragnment>
        )}
      </For>
    </Box>
  )
}
