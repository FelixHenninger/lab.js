import { maxRepSeries as mrs, minRepDistance as mrd } from './checks'

export const maxRepSeries =
  (n: number, equality?: (a: any, b: any) => boolean) => (arr: any[]) =>
    mrs(arr, equality) <= n

export const minRepDistance =
  (
    n: number, //
    hash?: (a: any) => string,
  ) =>
  (arr: any[]) =>
    (mrd(arr, hash) ?? Infinity) >= n
