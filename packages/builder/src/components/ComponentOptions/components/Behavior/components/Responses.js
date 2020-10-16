import React, { Fragment } from 'react'

import { Field } from 'formik'
import { CardBody, FormGroup, Col, Label } from 'reactstrap'

import { Input } from '../../../../Form'
import { Table, DefaultRow } from '../../../../Form/table'

import Card from '../../../../Card'
import Hint from '../../../../Hint'

const ResponseHeader = () =>
  <thead>
    <tr>
      <th />
      <th className="px-2 pt-3">
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
      </th>
      <th className="px-2 pt-3">
        action
        <span className="text-muted font-weight-normal"> · event</span>
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
      </th>
      <th className="px-2 pt-3">
        target
        <Hint className="ml-2">
          <p className="font-weight-bold">
            The <code>target</code> of the action. This limits a response to certain parts of the screen &ndash; leave blank to record responses for the entire window.
          </p>
          <p>
            The best example for this is if you're looking for clicks on a specific part of the screen rather than anywhere.
          </p>
          <p className="text-muted">
            On <strong>canvas-based screens</strong>, <code>AOIs</code> can be used as target areas. To do so, please enter the <code>@</code> sign followed by the <code>AOI</code> label, for example <code>@label</code>.
          </p>
          <p className="text-muted">
            On <strong><code>HTML</code>-based screens</strong>, the target areas are defined by <code>CSS</code> selectors, e.g. <code>button#option_a</code> corresponds to a <code>&lt;button id="option_a" /&gt;</code> element on screen.
          </p>
        </Hint>
      </th>
      <th className="px-2 pt-3">
        filter
        <span className="text-muted font-weight-normal"> · key/button</span>
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
            <dd>Label of the key pressed, e.g. <code>s</code>, <code>l</code>, <code>Space</code>, <code>Comma</code>, etc. (upper case is available for letters)</dd>
            <dt>Mouse events</dt>
            <dd>Number corresponding to the mouse button, where <code>0</code> is the innermost button (to the left on a right-handed mouse and vice-versa).</dd>
          </dl>
        </Hint>
      </th>
      <th />
    </tr>
  </thead>

const ResponseRow = ({ index, name, arrayHelpers }) =>
  <DefaultRow
    index={ index } arrayHelpers={ arrayHelpers }
    wrapper={ Fragment }
  >
    <td>
      <Field
        name={ `${ name }.label` }
        component={ Input }
        className="text-monospace"
      />
    </td>
    <td>
      <Field
        name={ `${ name }.event` }
        as="select"
        className="text-monospace form-control custom-select"
      >
        <option value="">none (inactive)</option>
        <option value="keypress">keypress</option>
        <option value="keydown">keydown</option>
        <option value="keyup">keyup</option>
        <option value="click">click</option>
        <option value="mousedown">mousedown</option>
        <option value="mouseup">mouseup</option>
        <option value="mouseenter">mouseenter</option>
        <option value="mouseleave">mouseleave</option>
      </Field>
    </td>
    <td>
      <Field
        name={ `${ name }.target` }
        placeholder="window"
        component={ Input }
        className="text-monospace"
      />
    </td>
    <td>
      <Field
        name={ `${ name }.filter` }
        placeholder="any"
        component={ Input }
        className="text-monospace"
      />
    </td>
  </DefaultRow>

export default () =>
  <Card title="Responses" wrapContent={ false } className="mt-4">
    <Table
      name="responses"
      columns={ 4 }
      row={ ResponseRow }
      header={ ResponseHeader }
      className="grid border-top-0 border-bottom"
    />
    <CardBody>
      <FormGroup row>
        <Label for="correctResponse" xs="2">
          Correct response
          <Hint
            title="Correct response"
            className="float-right"
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
          <Field
            name="correctResponse"
            placeholder="Undefined"
            component={ Input }
            className="text-monospace"
          />
        </Col>
      </FormGroup>
    </CardBody>
  </Card>
