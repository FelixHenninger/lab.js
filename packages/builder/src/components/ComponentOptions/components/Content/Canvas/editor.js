import React, { Component } from 'react'
import { LocalForm, actions } from 'react-redux-form'
import { FormGroup, Button, ButtonGroup } from 'reactstrap'

import { AddDropDown, Dimensions, Layers } from './form'
import Color from 'color'

import FabricCanvas from './fabric'

export default class CanvasEditor extends Component {
  constructor(...args) {
    super(...args)
    this.canvas = null
    this.state = {
      type: ''
    }
  }

  // TODO: I'm not entirely sure why
  // this needs to be a method, but
  // I'm assuming that there's a reason
  attachDispatch(dispatch) {
    this.formDispatch = dispatch;
  }

  updateForm({ target }) {
    console.log('updating form with data', target)

    this.setState({
      type: target.type
    })

    this.formDispatch(
      actions.merge('target', {
        'left': target.left,
        'top': target.top,
        'width': target.width,
        'height': target.height,
        'angle': target.angle,
        // Normalize color to hex representation
        // TODO: normalize only if not already hex color,
        // or move conversion to control (which might convert
        // back to rgb(r, g, b) notation)
        'fill': (new Color(target.fill)).hex(),
      })
    )
  }

  resetForm() {
    this.formDispatch(
      actions.reset('target')
    )

    this.setState({
      type: undefined
    })
  }

  updateCanvas(data) {
    console.log('updating canvas with data', data)

    const newData = { ...data }

    if (this.state.type === 'circle') {
      newData.radius = data.width / 2
    } else if (this.state.type === 'ellipse') {
      newData.rx = data.width / 2
      newData.ry = data.height / 2
    }

    this.canvas.modifyActive('set', newData)
  }

  render() {
    return <div>
      <FabricCanvas
        ref={ c => this.canvas = c }
        updateHandler={ (data) => this.updateForm(data) }
        clearSelectionHandler={ () => this.resetForm() }
      />
      <hr />
      <div>
        <FormGroup>
          <AddDropDown
            addHandler={ (...args) => this.canvas.add(...args) }
            removeHandler={ () => this.canvas.modifyActive('remove') }
          />
          <Layers
            upHandler={ () => this.canvas.modifyActive('bringForward') }
            downHandler={ () => this.canvas.modifyActive('sendBackwards') }
            className="ml-2"
          />
          <ButtonGroup
            className="ml-2"
          >
            <Button
              onClick={ () => console.log(
                JSON.stringify(this.canvas.toObject(), null, '  ')
              ) }
            >
              <i className="fa fa-code" />
            </Button>
          </ButtonGroup>
        </FormGroup>
        {/*  */}
        <LocalForm
          model="target"
          initialState={{
            left: '',
            top: '',
            width: '',
            height: '',
            angle: '',
            fill: '',
          }}
          onChange={ data => this.updateCanvas(data) }
          getDispatch={ dispatch => this.attachDispatch(dispatch) }
        >
          <FormGroup>
            <Dimensions type={ this.state.type } />
          </FormGroup>
        </LocalForm>
      </div>
    </div>
  }
}
