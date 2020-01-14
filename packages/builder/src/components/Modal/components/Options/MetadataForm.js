import React from 'react'

import { LocalForm, Control } from 'react-redux-form'
import { FormGroup, Label, Input, FormText, Col } from 'reactstrap'

import { updateComponent } from '../../../../actions/components'
import { connect } from 'react-redux'

const MetadataForm = ({ data, updateComponent }) =>
  <LocalForm
    initialState={ data }
    onChange={ newData => updateComponent('root', { metadata: newData }) }
  >
    <h4 className="mt-1">
      Study information
    </h4>
    <p className="text-muted">
      Please tell your fellow scientists a few things about your study.
    </p>
    <hr />
    <FormGroup row>
      <Label for="title" sm={2}>
        Title
      </Label>
      <Col sm={10}>
        <Control
          model=".title"
          id="title"
          component={ Input }
          controlProps={{
            bsSize: 'lg',
            className: 'font-weight-bold'
          }}
          style={{
            paddingLeft: '12px',
          }}
        />
      </Col>
    </FormGroup>
    <FormGroup row>
      <Label for="description" sm={2}>
        Description
      </Label>
      <Col sm={10}>
        <Control
          id="description"
          model=".description"
          component={Input}
          controlProps={{
            type: 'textarea',
            lines: 3
          }}
        />
        <FormText color="muted">
          What does your study do?
        </FormText>
      </Col>
    </FormGroup>
    <hr />
    <FormGroup row>
      <Label for="repository" size="sm" sm={2}>
        Repository
      </Label>
      <Col sm={10}>
        <Control
          id="repository"
          model=".repository"
          placeholder="https://osf.io/... / https://github.com/..."
          component={Input}
          controlProps={{
            bsSize: 'sm',
          }}
          style={{
            fontFamily: 'Fira Code',
          }}
        />
        <FormText color="muted">
          Where can researchers find the canonical or latest version of your study?
        </FormText>
      </Col>
    </FormGroup>
    <FormGroup row>
      <Label for="contributors" size="sm" sm={2}>
        Contributors
      </Label>
      <Col sm={10}>
        <Control
          id="contributors"
          model=".contributors"
          component={Input}
          controlProps={{
            type: 'textarea',
            bsSize: 'sm',
          }}
          placeholder="Rita Levi-Montalcini &lt;rlm@nobel.example&gt; (http://ibcn.cnr.it)"
          style={{
            fontFamily: "Fira Code",
          }}
        />
        <FormText color="muted">
          <em>One line each, please!</em> To keep things tidy, please enter full names (or secret pseudonyms) for everyone who helped build this study. You can also add an email address (in angle brackets) and a link (in round brackets).
        </FormText>
      </Col>
    </FormGroup>
  </LocalForm>

const mapStateToProps = state => ({
  data: state.components['root'].metadata
})
const mapDispatchToProps = {
  updateComponent
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MetadataForm)
