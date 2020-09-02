import { maxRepSeries as mrs, minRepDistance as mrd } from './checks'

export const maxRepSeries = (n: any, equality: any) => (arr: any) =>
  mrs(arr, equality) <= n
// @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
export const minRepDistance = (n: any, hash: any) => (arr: any) =>
  mrd(arr, hash) >= n
