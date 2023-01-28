import { Component } from '../../core/component'

const weightedMean = function (values: number[], weights: number[]) {
  if (values.length !== weights.length) {
    throw new Error('Values and weights arrays must be of equal length')
  }

  const weightedSum = values.reduce((sum, v, i) => sum + v * weights[i], 0)
  const weightSum = weights.reduce((sum, w) => sum + w, 0)

  return weightedSum / weightSum
}

export const calcProgress = function (nested: Component[]) {
  return weightedMean(
    nested.map(c => c.progress),
    nested.map(c => c.options.progressWeight ?? 1),
  )
}
