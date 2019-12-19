import React, { Component } from 'react'
import { ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'
import { Control, LocalForm } from 'react-redux-form'

import Modal from '../../../../../Modal'
import Grid from '../../../../../Grid'
import { GridCell as InputCell } from '../cells'

// Copied from the library combinatorics implementation
const product = function* (...sets) {
  let thresholds = sets
    .map(s => Math.max(s.length, 1)).reverse()
    .reduce(
      (acc, current, i) => acc.concat([
        (acc[i - 1] || 1) * current
      ]), []
    )
    .reverse()

  for (let counter = 0; counter < thresholds[0]; counter++) {
    yield sets.map(
      (s, i) => s[Math.floor(counter / (thresholds[i + 1] || 1)) % s.length]
    )
  }
}

const headers = ['Factor', 'Levels']
const HeaderCell = ({ index }) =>
  <div>
    { headers[index] }
  </div>

const TextAreaCell = ({ cellData, rowIndex, colIndex, colName }) => {
  const lines = (cellData || '').split('\n').length

  return (
    <Control.textarea
      model={ `.rows[${ rowIndex }][${ colIndex }]` }
      className="form-control"
      style={{
        fontFamily: 'Fira Mono',
        // Align content with textarea
        paddingTop: '7px',
        // Dynamic sizing
        height: `${ (lines + 1.5) * 1.6 }em`,
        minHeight: '80px',
        maxHeight: '150px',
        transition: 'height 0.05s ease-in-out',
      }}
    />
  )
}

const GridCell = (props) => {
  if (props.colIndex === 0) {
    return <InputCell { ...props } />
  } else {
    return <TextAreaCell { ...props } />
  }
}

class FactorialModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      formData: {
        factors: {
          rows: [
            ['Factor A', 'Level A1\nLevel A2'],
            ['Factor B', 'Level B1\nLevel B2']
          ],
        },
      },
    }
    this.promiseHandlers = {}
  }

  // TODO: Think about collapsing the logic from this modal,
  // and the FileHandler, into one.
  toggle() {
    this.setState((prevState) => {
      // Reject promise
      if (prevState.active && this.promiseHandlers.reject) {
        this.promiseHandlers.reject('FileSelector hidden')
      }

      // Switch state
      return { open: !prevState.open }
    })
  }

  async show() {
    this.toggle()
    return new Promise(
      (resolve, reject) => {
        this.promiseHandlers = {
          resolve: result => {
            this.setState({ open: false })
            return resolve(result)
          },
          reject
        }
      }
    )
  }

  generate() {
    const factors = this.state.formData.factors.rows
      .map(r => r[0])
    const levels = this.state.formData.factors.rows
      .map(r => r[1].split('\n').filter(c => c !== ''))

    const output = {
      columns: factors.map(f => ({ name: f, type: 'string' })),
      rows: Array.from(product(...levels)),
    }

    if (this.promiseHandlers.resolve) {
      this.promiseHandlers.resolve(output)
    }

    return output
  }

  render() {
    return (
      <Modal
        isOpen={ this.state.open }
        modalProps={{
          size: 'lg'
        }}
      >
        <LocalForm
          initialState={ this.state.formData }
          onChange={ formData => this.setState({ formData }) }
          getDispatch={ dispatch => this.formDispatch = dispatch }
        >
          <div className="modal-content">
            <ModalHeader
              toggle={ () => this.toggle() }
            >
              Generate factorial design
            </ModalHeader>
            <ModalBody>
              <p><strong>Please specify the factors in your design, as well as their levels.</strong> <span className="text-muted">The resulting design is fully crossed, meaning that in the loop, every level of a factor is combined with every level of every other factor.</span></p>
              <hr style={{ marginBottom: '0' }} />
            </ModalBody>
            <Grid
              model=".factors"
              data={ this.state.formData.factors.rows }
              HeaderContent={ HeaderCell }
              BodyContent={ GridCell }
              columns={ ['factor', 'levels'] }
              defaultRow={ [ '', '' ] }
              formDispatch={ action => this.formDispatch(action) }
              className="border-top-0"
            />
            <ModalFooter>
              <Button outline color="secondary" onClick={ () => this.toggle() }>
                Close
              </Button>
              <Button outline color="primary" onClick={ () => this.generate() }>
                Generate
              </Button>
            </ModalFooter>
          </div>
        </LocalForm>
      </Modal>
    )
  }
}

export default FactorialModal
