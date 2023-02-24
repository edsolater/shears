/// <reference lib="webworker" />

globalThis.addEventListener('message', (ev) => {
  console.log('pass from main thread' + ev.data)
})
