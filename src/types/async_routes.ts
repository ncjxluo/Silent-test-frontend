import type { Component } from 'vue'

export interface AsyncRoute {
  path: string
  name: string
  component:  (() => Promise<unknown>) | undefined
  children?: AsyncRoute[]
}
