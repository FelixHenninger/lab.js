import { maxRepSeries as mrs, minRepDistance as mrd } from './checks'

export const maxRepSeries = (n, equality) => (arr) => mrs(arr, equality) <= n
export const minRepDistance = (n, hash) => (arr) => mrd(arr, hash) >= n
