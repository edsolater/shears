import { Dynamic } from 'solid-js/web'
import { NativeProps } from '..'
import { AnyObj, omit, mergeObjects, hasProperty } from '@edsolater/fnkit'

export const domMap = (props: NativeProps, additionalProps: AnyObj | undefined) => ({
  div: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='div' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <div onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </div>
    ),

  span: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='span' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <span onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </span>
    ),
  p: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='p' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <p onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </p>
    ),
  nav: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='nav' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <nav onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </nav>
    ),
  img: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='img' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <img onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </img>
    ),
  a: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='a' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <a onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </a>
    ),
  button: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='button' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <button onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </button>
    ),
  input: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='input' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <input onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </input>
    ),
  details: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='details' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <details onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </details>
    ),
  summary: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='summary' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <summary onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </summary>
    ),
  dialog: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='dialog' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <dialog onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </dialog>
    ),
  label: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='label' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <label onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </label>
    ),
  form: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='form' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <form onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </form>
    ),
  iframe: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='iframe' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <iframe onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </iframe>
    ),
  canvas: () =>
    additionalProps || hasProperty(props, 'htmlProps') ? (
      <Dynamic component='canvas' {...mergeObjects(props.htmlProps, omit(props, 'htmlProps'), additionalProps)} />
    ) : (
      <canvas onClick={props.onClick} ref={props.ref} class={props.class} style={props.style}>
        {props.children}
      </canvas>
    ),
  // span: () => <span {...props} {...additionalProps} />,
  // p: () => <p {...props} {...additionalProps} />,
  // nav: () => <nav {...props} {...additionalProps} />,
  // img: () => <img {...props} {...additionalProps} />,
  // button: () => <button {...props} {...additionalProps} />,
  // input: () => <input {...props} {...additionalProps} />,
  // details: () => <details {...props} {...additionalProps} />,
  // summary: () => <summary {...props} {...additionalProps} />,
  // dialog: () => <dialog {...props} {...additionalProps} />,
  // label: () => <label {...props} {...additionalProps} />,
  // form: () => <form {...props} {...additionalProps} />,
  // iframe: () => <iframe {...props} {...additionalProps} />,
  // canvas: () => <canvas {...props} {...additionalProps} />, // for lazy invoke
})
