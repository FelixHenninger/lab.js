import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { CardBody, CardText, CardTitle, CardSubtitle,
  ListGroup, ListGroupItem } from 'reactstrap'

import { fromObject } from '../../../../../logic/io/load'

const basePath =
  'https://raw.githubusercontent.com/FelixHenninger/lab.js/master/examples/'

// Transform an array of names into an author list, e.g.
// ['Felix', 'Yury', 'Ulf', 'Pascal', 'Ben'] => 'Felix, Yury, ... & Ben'
const etAl = (acc='', c, i, arr) =>
  acc === ''
    ? c
    : acc + (i < arr.length - 1 ? ', ' : ' & ') + c

const Task = ({ name, contributors, description, url, clickHandler }) =>
  <ListGroupItem
    style={{ cursor: 'pointer' }}
    onClick={ clickHandler }
  >
    <div className="d-flex w-100 justify-content-between">
      <strong>
        { name }
      </strong>
      <span className="text-muted">
        { (contributors || [''])
            .filter(c => !c.includes('Felix Henninger'))
            .reduce(etAl, '') }
      </span>
    </div>
    {/* Give further content class mt-1 --> */}
  </ListGroupItem>

class TaskList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      state: 'empty',
      examples: [],
    }
  }

  componentDidMount() {
    fetch(basePath + 'metadata.json')
      .then(response => response.json())
      .then(data => {
        this.setState({
          state: 'loaded',
          examples: data,
        })
      })
      .catch(() => {
        this.setState({
          state: 'error',
        })
      })
  }

  loadTask(path) {
    fetch(basePath + path)
      .then(response => response.json())
      .then(data => {
        const state = fromObject(data)
        this.context.store.dispatch({
          type: 'HYDRATE', state,
        })
      })
  }

  render() {
    if (this.state.state === 'error') {
      return (
        <ListGroup className="list-group-flush">
          <ListGroupItem className="text-center text-muted">
            <i className="fas fa-exclamation-circle fa-2x mt-3 mb-2" />{' '}
            <p>
              <strong>Sorry, I couldn't load the examples</strong><br />
              <small>
                This shouldn't happen.
                If this persists even though you're online, could you please
                <a href="http://labjs.readthedocs.io/en/latest/meta/contribute/help.html">let us know</a>?
              </small>
            </p>
          </ListGroupItem>
        </ListGroup>
      )

    } else if (this.state.examples.length === 0) {
      // Loading spinner
      return (
        <ListGroup className="list-group-flush">
          <ListGroupItem className="text-center">
            <i className="fas fa-spinner-third fa-spin" />
          </ListGroupItem>
        </ListGroup>
      )
    } else {
      // Example overview
      return (
        <ListGroup className="list-group-flush">
          {
            this.state.examples.map(
              (example, i) => <Task
                key={`example-${i}`}
                clickHandler={ () => this.loadTask(example.path) }
                { ...example }
              />
            )
          }
        </ListGroup>
      )
    }
  }
}

TaskList.contextTypes = {
  store: PropTypes.object
}

export default () =>
  <div>
    <CardBody>
      <CardTitle className="mt-2">Examples</CardTitle>
      <CardSubtitle className="text-muted mb-3">
        Pre-made, ready-to-run studies
      </CardSubtitle>
      <CardText>
        These examples are made by researchers like you! If you're building a study, we'd love to add it here &mdash; please <a href="https://labjs.readthedocs.io/en/latest/meta/contribute/index.html">let us know</a>!
      </CardText>
      <CardText>
        Please click on any of the paradigms to open it; they're yours to try, reuse and extend.
      </CardText>
    </CardBody>
    <TaskList />
    <CardBody>
      <small className="text-muted">
        Missing a task? Something to improve? Please <a href="https://labjs.readthedocs.io/en/latest/meta/contribute/index.html">suggest or contribute</a>!
      </small>
    </CardBody>
  </div>
