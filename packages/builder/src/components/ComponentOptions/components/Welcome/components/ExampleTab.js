import React, { Component } from 'react'
import { ReactReduxContext } from 'react-redux'

import { CardBody, CardText, CardTitle, CardSubtitle,
  ListGroup, ListGroupItem } from 'reactstrap'

import { fromObject } from '../../../../../logic/io/load'

const basePath =
  process.env.REACT_APP_EXAMPLE_PATH ??
  'https://raw.githubusercontent.com/FelixHenninger/lab.js/master/tasks/'

// Transform an array of names into an author list, e.g.
// ['Felix', 'Yury', 'Ulf', 'Pascal', 'Ben'] => 'Felix, Yury, ... & Ben'
const etAl = (acc='', c, i, arr) =>
  acc === ''
    ? c
    : acc + (i < arr.length - 1 ? ', ' : ' & ') + c

const Task = ({ name, contributors, description, url, clickHandler }) =>
  <ListGroupItem action
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

export class TaskList extends Component {
  static contextType = ReactReduxContext

  constructor(props) {
    super(props)

    this.state = {
      state: 'empty',
      tasks: [],
    }
  }

  async componentDidMount() {
    try {
      const response = await fetch(this.props.path + 'metadata.json')
      const data = await response.json()
      this.setState({ state: 'loaded', tasks: data })
    } catch {
      this.setState({ state: 'error' })
    }
  }

  async loadTask(path) {
    const response = await fetch(this.props.path + path)
    const task = fromObject(await response.json())
    this.props.loadHandler(task, this.context.store.dispatch)
  }

  render() {
    if (this.state.state === 'error') {
      return (
        <ListGroup className="list-group-flush">
          <ListGroupItem className="text-center text-muted">
            <i className="fas fa-exclamation-circle fa-2x mt-3 mb-2" />{' '}
            <p>
              <strong>
                Sorry, I couldn't load the { this.props.taskLabel }
              </strong><br />
              <small>
                This shouldn't happen.
                If it persists even though you're online,
                could you please{' '}
                <a href="http://labjs.readthedocs.io/en/latest/meta/contribute/help.html" target="_blank" rel="noopener noreferrer">let us know</a>?
              </small>
            </p>
          </ListGroupItem>
        </ListGroup>
      )

    } else if (this.state.tasks.length === 0) {
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
            this.state.tasks.map(
              (task, i) => <Task
                key={`task-${i}`}
                clickHandler={ () => this.loadTask(task.path) }
                { ...task }
              />
            )
          }
        </ListGroup>
      )
    }
  }
}

TaskList.defaultProps = {
  taskLabel: 'tasks',
}

export default () =>
  <>
    <CardBody>
      <CardTitle className="h5 mt-2">Examples</CardTitle>
      <CardSubtitle className="text-muted mb-3">
        Pre-made, ready-to-run studies
      </CardSubtitle>
      <CardText>
        These examples are made by researchers like you! If you're building a study, we'd love to add it here &mdash; please <a href="https://labjs.readthedocs.io/en/latest/meta/contribute/index.html" target="_blank" rel="noopener noreferrer">let us know</a>!
      </CardText>
      <CardText>
        Please click on any of the paradigms to open it; they're yours to try, demonstrate, replicate and extend.
      </CardText>
    </CardBody>
    <TaskList
      path={ basePath }
      taskLabel="examples"
      loadHandler={
        (state, dispatch) => dispatch({
          type: 'HYDRATE',
          state,
        })
      }
    />
    <CardBody>
      <small className="text-muted">
        Missing a task? Something to improve? Please <a href="https://labjs.readthedocs.io/en/latest/meta/contribute/index.html" target="_blank" rel="noopener noreferrer">suggest or contribute</a>!
      </small>
    </CardBody>
  </>
