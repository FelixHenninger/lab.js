import { maxRepSeries as mrs, minRepDistance as mrd } from './checks'

export const minRepDistance = (n) => (arr) => mrd(arr) >= n
export const maxRepSeries = (n, equality) => (arr) => mrs(arr, equality) <= n
