import React from 'react'
import { Control } from 'react-redux-form'
import { CardBody, FormGroup, Col, Label } from 'reactstrap'

import Card from '../../Card'
import Grid from '../../Grid'
import Hint from '../../Hint'
import Form from './Form'

const GridCell = ({ cellData, rowIndex, colIndex, colName }) => {
  if (colIndex === 1) {
    return <Control.select
      model={ `.rows[${ rowIndex }][${ colIndex }]` }
      className="form-control custom-select"
      style={{
        fontFamily: 'Fira Mono',
        color: cellData === '' ? 'var(--gray)' : 'inherit',
      }}
    >
      <option value="">undefined</option>
      <option value="keypress">keypress</option>
      <option value="keydown">keydown</option>
      <option value="keyup">keyup</option>
      <option value="click">click</option>
      <option value="mousedown">mousedown</option>
      <option value="mouseup">mouseup</option>
    </Control.select>
  } else {
    const placeholder = colIndex === 2 ? 'window' : ''
    return <Control.text
      model={ `.rows[${ rowIndex }][${ colIndex }]` }
      placeholder={ placeholder }
      className="form-control"
      style={{
        fontFamily: 'Fira Mono',
      }}
      debounce={ 300 }
    />
  }
}

const HeaderCell = ({ columnData }) =>
  <span
    style={{
      paddingLeft: '0.25rem',
    }}
  >
    { columnData }
  </span>

const Content = ({ id, data, formDispatch }) =>
  <div>
    <Grid
      model=".responses"
      data={ data.responses.rows }
      columns={ [
        <span>
          label
          <Hint className="ml-2">
            <p className="font-weight-bold">
              <code>label</code> assigned to a particular response action on part of the participant.
            </p>
            <p className="text-muted">
              The label reflects the <em>meaning</em> of participants' responses. We save the label corresponding to the recorded action in the data.
            </p>
            <p className="text-muted">
              It is possible to have multiple alternative response actions with the same label, for example if participants can use one of several response modalities to indicate their response.
            </p>
          </Hint>
        </span>,
        <span>
          action
          <span class="text-muted font-weight-normal"> · event</span>
          <Hint className="ml-2">
            <p className="font-weight-bold">
              Type of <code>action</code> participants can take to indicate a response. This corresponds to browser events.
            </p>
            <dl className="text-muted">
              <dt>keypress</dt>
              <dd>Pushing a key on the keyboard and releasing it.</dd>
              <dt>keydown</dt>
              <dd>Holding down a key.</dd>
              <dt>keyup</dt>
              <dd>Releasing a key.</dd>
              <dt>click</dt>
              <dd>Pressing and releasing a mouse button.</dd>
              <dt>mousedown</dt>
              <dd>Holding down a mouse button.</dd>
              <dt>mouseup</dt>
              <dd>Releasing a mouse button.</dd>
            </dl>
          </Hint>
        </span>,
        <span>
          target
          <Hint className="ml-2">
            <p className="font-weight-bold">
              The <code>target</code> of the action. This limits a response to certain parts of the screen &ndash; leave blank to record responses for the entire window.
            </p>
            <p>
              The best example for this is if you're looking for clicks on a specific part of the screen rather than anywhere.
            </p>
            <p>
              The target areas are defined by <code>CSS</code> selectors, e.g. <code>button#option_a</code> corresponds to a <code>&lt;button id="option_a" /&gt;</code> element on screen.
            </p>
          </Hint>
        </span>,
        <span>
          filter
          <span class="text-muted font-weight-normal"> · key/button</span>
          <Hint className="ml-2">
            <p className="font-weight-bold">
              Additional <code>filter</code> applied to the action.
            </p>
            <p>
              For the most part, this specifies the key or button corresponding to the response. Leave empty to count any key or button as the corresponding response.
            </p>
            <p>
              Multiple options are allowed if seperated by a comma.
            </p>
            <dl className="text-muted">
              <dt>Keyboard events</dt>
              <dd>Label of the key pressed, e.g. <code>s</code>, <code>l</code>, <code>Space</code> etc. (upper case is available for letters)</dd>
              <dt>Mouse events</dt>
              <dd>Number corresponding to the mouse button, where <code>0</code> is the innermost button (to the left on a right-handed mouse and vice-versa).</dd>
            </dl>
          </Hint>
        </span>,
      ] }
      columnWidths={ [30, 20, 20, 20] }
      HeaderContent={ HeaderCell }
      BodyContent={ GridCell }
      formDispatch={ formDispatch }
    />
    <CardBody>
      <FormGroup row>
        <Label for="correctResponse" xs="2">
          Correct
          <Hint
            title="Correct response"
            className="pull-right"
          >
            <p className="font-weight-bold">
              Label of the response classified as correct.
            </p>
            <p className="text-muted">
              The entry here should correspond to one of the labels assigned to responses in the first column above (placeholders can also be used for varying correct responses).
            </p>
          </Hint>
        </Label>
        <Col xs="10">
          <Control
            model=".correctResponse"
            placeholder="Undefined"
            type="text"
            className="form-control" id="correctResponse"
            style={{
              fontFamily: 'Fira Mono',
            }}
            debounce={ 300 }
          />
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="timeout" xs="2">
          Timeout
          <Hint
            title="Timeout"
            className="pull-right"
          >
            <p className="font-weight-bold">
              End component automatically after a given number of milliseconds.
            </p>
            <p className="text-muted">
              If responses are defined alongside a timeout, whichever comes first will end the component.
            </p>
          </Hint>
        </Label>
        <Col xs="10">
          <div className="input-group">
            <Control
              model=".timeout"
              placeholder="Never"
              pattern="(\d+)|(\$\{.*\})" // Accept number or placeholder
              className="form-control" id="timeout"
              style={{
                fontFamily: 'Fira Mono',
              }}
              debounce={ 300 }
            />
            <div className="input-group-addon text-muted">ms</div>
          </div>
        </Col>
      </FormGroup>
    </CardBody>
  </div>

export default ({ id, data }) =>
  <Card title="Responses" wrapContent={ false }>
    <Form
      id={ id }
      data={ data }
      keys={ ['responses', 'correctResponse', 'timeout'] }
      getDispatch={ dispatch => this.formDispatch = dispatch }
    >
      <Content
        id={ id }
        data={ data }
        formDispatch={ action => this.formDispatch(action) }
      />
    </Form>
  </Card>
