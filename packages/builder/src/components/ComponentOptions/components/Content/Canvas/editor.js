import React, { Component } from 'react'
import { ReactReduxContext } from 'react-redux'

import { Formik } from 'formik'
import { AutoSave } from '../../../../Form'

import { FormGroup } from 'reactstrap'
import { fromPairs, isObject, omit, uniqueId } from 'lodash'

import AddDropDown from './components/form/AddDropDown'
import Dimensions from './components/form/Dimensions'
import Layers from './components/form/Layers'
import Style from './components/form/Style'

import FabricCanvas from './components/fabric'
import { fromCanvas, toCanvas } from './logic'

const trulyUniqueId = (existingIds=[]) => {
  let candidate = uniqueId()

  // Make sure no ids are used multiple times
  while (existingIds.includes(candidate)) {
    candidate = uniqueId()
  }

  return candidate
}

const prepareData = data => {
  const existingIds = data
    .filter(c => isObject(c) && c.id !== undefined)
    .map(c => c.id)

  const output = data
    .filter(c => isObject(c))
    .map(c => {
      // Add new id where not already present
      if (c.id) {
        return [c.id, c]
      } else {
        const newId = trulyUniqueId(existingIds)
        existingIds.push(newId)
        c.id = newId
        return [c.id, c]
      }
    })

  return [
    fromPairs(output), // Object with id => data mapping
    output.map(o => o[0]) // Array of ids in order
  ]
}

const emptyFormData = {
  left: '', top: '', angle: '',
  width: '', height: '',
}

export default class CanvasEditor extends Component {
  static contextType = ReactReduxContext
  _isMounted = false

  constructor(...args) {
    super(...args)

    const [data, order] = prepareData(this.props.data)
    this.state = {
      data, order,
      selection: undefined,
    }
    this.updateState = this.updateState.bind(this)

    this.canvas = React.createRef()
    this.form = React.createRef()
  }

  setState(data) {
    if (this._isMounted) {
      // Update component state, then store
      super.setState(data, () => {
        this.updateForm()
        this.updateState()
      })
    } else {
      // Flush canvas data directly to store
      this.updateState('override')
    }
  }

  updateState(mode='local') {
    if (mode === 'override') {
      // Update from raw canvas state
      // TODO: Investigate implications of this, specifically
      // avoid unnecessary invalidation/object mutations
      this.props.onChange(
        this.canvas.current.canvas._objects.map(o => fromCanvas(
          o.toObject(['id', 'label']),
          this.state.data[o.id],
        ))
      )
    } else {
      // Update from component state
      this.props.onChange(
        this.canvas.current.canvas._objects.map(o => this.state.data[o.id])
      )
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
    this.canvas.current.updateActive()
  }

  // Selection -----------------------------------------------------------------

  set selection(id) {
    this.setState({ selection: id })
    if (id === undefined) {
      this.form.current.setValues(emptyFormData)
    }
  }

  get selection() {
    return this.state.data[this.state.selection] || { type: undefined }
  }

  // User action handlers ------------------------------------------------------

  addContent(target) {
    this.updateContent(target, false)
    this.updateOrder()
  }

  deleteContent(target) {
    this.setState({ data: omit(this.state.data, [target.id]) })
    this.selection = undefined
  }

  updateContent(target, updateCanvas=true) {
    // Save the updated object in editor state,
    // after converting it into a raw object
    if (target.id) {
      this.setState({
        data: {
          ...this.state.data,
          [target.id]: target
        }
      })

      // Reflect modification on canvas
      if (updateCanvas) {
        this.canvas.current.modifyActive(
          'set', toCanvas(target, this.props.id, this.context.store, ['text'])
        )
      }
    }
  }

  updateOrder() {
    this.setState({ order: this.canvas.current.canvas._objects.map(o => o.id) })
  }

  // Form data handling --------------------------------------------------------

  // TODO: Think about merging this with the updateContent
  updateFromForm(formData) {
    // Prevent updates if the data for the currently selected object
    // is not yet available in the editor state. This catches a weird
    // edge case during object cloning where an object is added and
    // the selection changes, but the data is not yet available through
    // the editor state, even though it catches up shortly after.
    // This glitch likely reflects an issue in the underlying updating
    // and syncronisation logic, and will require a more careful
    // analysis in the mid-term
    if (this.state.data[this.state.selection]) {
      const newData = { ...formData }

      this.updateContent({
        ...newData,
        // Preserve type information
        // (which is sometimes lost through the form)
        type: this.state.selection
          ? this.state.data[this.state.selection].type
          : undefined,
        id: this.state.selection,
      }, true) // also update canvas
    }
  }

  updateForm() {
    this.form.current.setValues(this.selection)
  }

  uniqueId() {
    return trulyUniqueId(this.state.order)
  }

  render() {
    const selection = this.selection

    return <>
      <FabricCanvas
        id={ this.props.id }
        data={ this.state.order.map(id => toCanvas(this.state.data[id], this.props.id, this.context.store)) }
        ref={ this.canvas }
        addHandler={
          ({ target }) => this.addContent(target.toObject(['id', 'label']))
        }
        deleteHandler={ ({ target }) => this.deleteContent(target) }
        updateHandler={ ({ target }) => {
          this.updateContent(
            fromCanvas(
              target.toObject(['id', 'label']),
              this.state.data[target.id],
            ),
            false,
          )
        } }
        updateSelectionHandler={ ({ target }) => this.selection = target.id }
        clearSelectionHandler={ () => this.selection = undefined }
        idSource={ () => this.uniqueId() }
      />
      <hr />
      <Formik
        innerRef={ this.form }
        initialValues={ selection }
      >
        <FormGroup className="toolbar d-flex">
          <AutoSave
            interval={ 25 }
            onSave={ newState => {
              // Avoid an infinite updating cycle
              // (TODO: There must be a smarter way! Also, this still
              // re-renders twice for every change, for unknown reasons)
              if (newState !== selection) {
                this.updateFromForm(newState)
              }
            } }
          />
          <AddDropDown
            addHandler={ (...args) => this.canvas.current.add(...args) }
            removeHandler={ () => this.canvas.current.modifyActive('remove') }
            cloneHandler={ () => this.canvas.current.cloneActive() }
            selection={ selection }
          />
          <Layers
            type={ selection.type }
            upHandler={ () => {
              this.canvas.current.modifyActive('bringForward')
              // The canvas does not signal this modification,
              // so trigger update manually
              this.updateOrder()
            } }
            downHandler={ () => {
              this.canvas.current.modifyActive('sendBackwards')
              this.updateOrder()
            } }
          />
          <Dimensions
            selection={ selection }
            type={ selection.type }
          />
          <Style
            type={ selection.type }
            selection={ selection }
            changeHandler={ (attr, value) => {
              if (isObject(attr)) {
                this.form.current.setValues(attr)
              } else {
                this.form.current.setFieldValue(attr, value)
              }
            } }
          />
        </FormGroup>
      </Formik>
    </>
  }
}
