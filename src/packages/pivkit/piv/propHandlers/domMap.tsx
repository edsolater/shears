import { AnyObj } from '@edsolater/fnkit'
import { Dynamic } from 'solid-js/web'
import { NativeProps } from '..'

export const domMap = (props: NativeProps, additionalProps: AnyObj | undefined) => ({
  div: () => (
    <div
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </div>
  ),

  span: () => (
    <span
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </span>
  ),
  p: () => (
    <p
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </p>
  ),
  button: () => (
    <button
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </button>
  ),
  input: () => (
    <input
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  textarea: () => (
    <textarea
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  select: () => (
    <select
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </select>
  ),
  nav: () => (
    <nav
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </nav>
  ),
  ul: () => (
    <ul
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </ul>
  ),
  li: () => (
    <li
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      style={props.style}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </li>
  ),
  img: () => (
    <img
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  svg: () => (
    <svg
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  a: () => (
    <a
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </a>
  ),
  iframe: () => (
    <iframe
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  Dynamic: () => (
    <Dynamic
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    />
  ),
  label: () => (
    <label
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </label>
  ),
  summary: () => (
    <summary
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </summary>
  ),
  datails: () => (
    <details
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </details>
  ),
  dialog: () => (
    <dialog
      // solidjs prefer solid props for variable reactive
      onClick={props.onClick}
      ref={props.ref}
      class={props.class}
      {...props.htmlProps}
      {...additionalProps}
    >
      {props.children}
    </dialog>
  ),
})
