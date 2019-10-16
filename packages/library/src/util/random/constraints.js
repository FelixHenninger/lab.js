import { maxRunLength, minDistance } from './checks'

export const longestRun = (n) => (arr) => maxRunLength(arr) <= n
export const minimumDistance = (n) => (arr) => minDistance(arr) >= n
