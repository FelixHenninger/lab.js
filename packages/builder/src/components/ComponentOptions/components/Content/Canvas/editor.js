import React, { Component } from 'react'
import { LocalForm, actions } from 'react-redux-form'
import { FormGroup } from 'reactstrap'
import { fromPairs } from 'lodash'

import { AddDropDown, Style, Dimensions, Layers } from './form'
import Color from 'color'

import FabricCanvas from './fabric'

const defaults = type => {
  // Properties of all objects
  const basics = {
    left: '', top: '',
    width: '', height: '',
    angle: '',
    fill: '', stroke: '',
  }

  // Type-specific additions
  switch (type) {
    case 'text':
    case 'i-text':
      return {
        ...basics,
        fontSize: 32,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontFamily: '',
      }
    default:
      return basics
  }
}

export default class CanvasEditor extends Component {
  constructor(...args) {
    super(...args)
    this.canvas = null
    this.selection = {
      type: undefined,
    }
  }

  // Canvas → form
  updateForm({ target }) {
    const newData = fromPairs(
      Object.keys(defaults(target.type))
        .map(property => [property, target[property]])
    )

    this.selection = target
    this.formDispatch(
      actions.merge('target', {
        // Select properties to transfer into form,
        // and build an object based on the selection.
        ...newData,
        // Normalize color to hex representation
        // TODO: normalize only if not already hex color,
        // or move conversion to control (which might convert
        // back to rgb(r, g, b) notation)
        'fill': (new Color(target.fill)).hex().toLowerCase(),
      })
    )

    this.props.onChange(
      this.canvas.toObject()
    )
  }

  resetForm() {
    this.selection = {
      type: undefined
    }

    this.formDispatch(
      actions.reset('target')
    )
  }

  // Form → canvas
  updateCanvas(data) {
    const newData = { ...data }

    if (this.selection.type === 'circle') {
      newData.radius = data.width / 2
    } else if (this.selection.type === 'ellipse') {
      newData.rx = data.width / 2
      newData.ry = data.height / 2
    }

    this.canvas.modifyActive('set', newData)
    this.props.onChange(
      this.canvas.toObject()
    )
  }

  render() {
    return <div>
      <FabricCanvas
        data={ this.props.data }
        ref={ c => this.canvas = c }
        updateHandler={ data => this.updateForm(data) }
        clearSelectionHandler={ () => this.resetForm() }
      />
      <hr />
      <LocalForm
        model="target"
        initialState={ defaults(this.selection.type) }
        onChange={ data => this.updateCanvas(data) }
        getDispatch={ dispatch => (this.formDispatch = dispatch) }
      >
        <FormGroup className="d-flex">
          <AddDropDown
            addHandler={ (...args) => this.canvas.add(...args) }
            removeHandler={ () => this.canvas.modifyActive('remove') }
            cloneHandler={ () => this.canvas.cloneActive() }
          />
          <Layers
            upHandler={ () => this.canvas.modifyActive('bringForward') }
            downHandler={ () => this.canvas.modifyActive('sendBackwards') }
          />
          <Dimensions
            type={ this.selection.type }
          />
          <Style
            type={ this.selection.type }
            selection={ this.selection }
            changeHandler={ (attr, value) =>
              this.formDispatch(actions.change(`target.${ attr }`, value)) }
          />
        </FormGroup>
      </LocalForm>
    </div>
  }
}
