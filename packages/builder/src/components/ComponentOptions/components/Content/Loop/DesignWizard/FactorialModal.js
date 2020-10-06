import React, { Fragment, Component } from 'react'

import { Formik, Form, Field } from 'formik'
import { ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'

import Modal from '../../../../../Modal'
import { Table, DefaultRow } from '../../../../../Form/table'
import { Input } from '../../../../../Form'

// Logic -----------------------------------------------------------------------
// (copied from the library combinatorics implementation)

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

const generateTable = (factors) => {
  const names = factors.map(f => f.name)
  const levels = factors.map(f => f.levels.split('\n').filter(c => c !== ''))

  return {
    columns: names.map(name => ({ name, type: 'string' })),
    rows: Array.from(product(...levels)),
  }
}

// UI --------------------------------------------------------------------------

const TableRow = ({ name, arrayHelpers }) =>
  <DefaultRow name={ name } arrayHelpers={ arrayHelpers } wrapper={ Fragment }>
    <td>
      <Field
        name={ `${ name }.name` }
        component={ Input }
        placeholder="Parameter name"
        className="text-monospace"
      />
    </td>
    <td>
      <Field
        name={ `${ name }.levels` }
        component="textarea"
        placeholder="Levels (one line each)"
        className="form-control text-monospace"
        style={{
          height: `${ (2 + 1.5) * 1.6 }em`, // TODO: Re-enable dynamic sizing
          minHeight: '80px',
          maxHeight: '150px',
        }}
      />
    </td>
  </DefaultRow>

const Header = () =>
  <thead>
    <tr>
      <th />
      <th className="px-2 pt-3">Factor</th>
      <th className="px-2 pt-3">Levels</th>
      <th />
    </tr>
  </thead>

class FactorialModal extends Component {
  constructor(props) {
    super(props)
    this.state = { isOpen: false }
    this.promiseHandlers = {}
    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.setState({ isOpen: !this.state.isOpen })
  }

  async show() {
    this.toggle()
    return new Promise(
      (resolve, reject) => {
        this.promiseHandlers = {
          resolve: result => {
            this.setState({ isOpen: false })
            return resolve(result)
          },
          reject
        }
      }
    )
  }

  render() {
    return <Modal
      isOpen={ this.state.isOpen }
      modalProps={{ size: 'lg' }}
    >
      <Formik
        initialValues={{
          factors: [
            { name: 'Factor A', levels: 'Level A1\nLevel A2' },
            { name: 'Factor B', levels: 'Level B1\nLevel B2' },
          ]
        }}
        onSubmit={ (values) => {
          console.log('in Onsubmit')
          const table = generateTable(values.factors)
          if (this.promiseHandlers.resolve) {
            this.promiseHandlers.resolve(table)
          }
        } }
      >
        <Form>
          <div className="modal-content">
            <ModalHeader toggle={ this.toggle }>
              Generate factorial design
            </ModalHeader>
            <ModalBody>
              <p><strong>Please specify the factors in your design, as well as their levels.</strong> <span className="text-muted">The resulting design is fully crossed, meaning that in the loop, every level of a factor is combined with every level of every other factor.</span></p>
              <hr style={{ marginBottom: '0' }} />
            </ModalBody>
            <Table
              name="factors"
              columns={ 2 }
              row={ TableRow }
              header={ Header }
              defaultItem={{ name: '', levels: '' }}
              className="grid border-top-0 mb-0"
            />
            <ModalFooter>
              <Button outline color="secondary" onClick={ this.toggle }>
                Close
              </Button>
              <Button outline color="primary" type="submit">
                Generate
              </Button>
            </ModalFooter>
          </div>
        </Form>
      </Formik>
    </Modal>
  }
}

export default FactorialModal
