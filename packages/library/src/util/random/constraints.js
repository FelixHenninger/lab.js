import { maxRepSeries as mrs, minRepDistance as mrd } from './checks'

export const maxRepSeries = (n) => (arr) => mrs(arr) <= n
export const minRepDistance = (n) => (arr) => mrd(arr) >= n
