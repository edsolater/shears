/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import path from 'path'

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000
  },
  resolve: {
    conditions: ['development', 'browser'],
    alias: {
      '@edsolater/piv': path.resolve(__dirname, './src/packages/piv'),
      '@edsolater/pivkit': path.resolve(__dirname, './src/packages/pivkit'),
      '@edsolater/jfetch': path.resolve(__dirname, './src/packages/jFetch'),
      '@edsolater/domkit': path.resolve(__dirname, './src/packages/domkit')
    }
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    transformMode: { web: [/\.[jt]sx?$/] },
    setupFiles: ['node_modules/@testing-library/jest-dom/extend-expect.js'],
    // otherwise, solid would be loaded twice:
    deps: { registerNodeLoader: true },
    // if you have few tests, try commenting one
    // or both out to improve performance:
    threads: false,
    isolate: false
  },
  build: {
    target: 'esnext'
  }
})
