import React from 'react'
import Card from '../../../Card'
import Hint from '../../../Hint'
import { FormGroup, Col, Label } from 'reactstrap'
import { Control } from 'react-redux-form'

export default (props) =>
  <Card { ...props } >
    <FormGroup row>
      <Col xs={2}>
        <Label
          xs={2}
          style={{
            paddingTop: '0', // This is a hack to override .col-form-label
          }}
        >
          Preparation
        </Label>
      </Col>
      <Col xs={10}>
        <FormGroup check>
          <Label check>
            <Control.checkbox
              model=".tardy"
              className="form-check-input"
            />
            &thinsp;
            Tardy
          </Label>
          <Hint
            title="Tardiness"
            style={{
              marginLeft: '1rem',
            }}
          >
            <p className="font-weight-bold">
              Prepare the component at the last possible moment, just before it is run.
            </p>
            <p className="text-muted">
              This is useful if the component depends on information that becomes available only during the study, for example if a screen's content depends on participant behavior.
            </p>
            <p className="text-muted">
              Ordinarily, a component is prepared when the page is loaded.
            </p>
          </Hint>
        </FormGroup>
      </Col>
    </FormGroup>
    <FormGroup row>
      <Col xs={2}>
        <Label
          xs={2}
          style={{
            paddingTop: '0', // This is a hack to override .col-form-label
          }}
        >
          Run
        </Label>
      </Col>
      <Col xs={10}>
        <FormGroup check>
          <Label check>
            <Control.checkbox
              model=".skip"
              className="form-check-input"
            />
            &thinsp;
            Skip
          </Label>
          <Hint
            title="Skip"
            style={{
              marginLeft: '1rem',
            }}
          >
            <p className="font-weight-bold">
              Don't run the component during the study.
            </p>
            <p className="text-muted">
              This will cause any component to be prepared, but not run.
            </p>
          </Hint>
        </FormGroup>
        <FormGroup check>
          <Label check>
            <Control.checkbox
              model=".scrollTop"
              className="form-check-input"
            />
            &thinsp;
            Scroll to top before running
          </Label>
          <Hint
            title="Scroll to Top"
            style={{
              marginLeft: '1rem',
            }}
          >
            <p className="font-weight-bold">
              Reset scroll position to the top of the page
              when showing content
            </p>
            <p className="text-muted">
              This is useful if the preceding and current screen
              both occupy a lot of vertical space, as it saves
              participants from having to scroll back upwards
              manually between pages.
            </p>
          </Hint>
        </FormGroup>
      </Col>
    </FormGroup>
  </Card>
