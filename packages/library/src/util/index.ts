export { Random } from './random'

import { makeRenderFunction } from '../canvas/util/render'
import { transform } from '../canvas/util/transform'
export const canvas = { makeRenderFunction, transform }

export * as combinatorics from './combinatorics'
export * as geometry from './geometry'
export * as fullscreen from './fullscreen'
export * as stats from './stats'

import { FrameTimeout } from '../core/timing/timeout'
export const timing = { FrameTimeout }

import { traverse, reduce } from '../base/util/tree'
export const tree = { traverse, reduce }
