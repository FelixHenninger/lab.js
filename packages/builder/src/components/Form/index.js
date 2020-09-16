import React from 'react'

import { connect } from 'formik'
import { Input as BaseInput, CustomInput as BaseCustomInput } from 'reactstrap'

import { useDebounce } from './hooks'

const _AutoSave = ({ formik: { values, dirty }, interval=300, onSave }) => {
  // Pass the form's dirtyness as a filter to the debounce function so
  // that only user entries are autosaved, and update loops are avoided.
  useDebounce(onSave, interval, [values], dirty)
  return null
}

export const AutoSave = connect(_AutoSave)

// Trivial wrapper around reactstrap's <Input /> component,
// to pass through all props
export const Input = ({ field, ...props }) =>
  <BaseInput { ...field } { ...props } />

// Likewise for CustomInput
export const CustomInput = ({ field, ...props }) =>
  <BaseCustomInput { ...field } { ...props } />
