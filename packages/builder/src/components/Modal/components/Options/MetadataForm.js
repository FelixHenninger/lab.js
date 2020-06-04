import React from 'react'

import { Formik, Field } from 'formik'
import { FormGroup, Label, FormText, Col } from 'reactstrap'

import { AutoSave, Input } from '../../../Form'
import { updateComponent } from '../../../../actions/components'
import { connect } from 'react-redux'

const MetadataForm = ({ data, updateComponent }) =>
  <Formik
    initialValues={ data }
  >
    <form>
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
          <Field
            name="title"
            component={ Input }
            bsSize="lg"
            className="font-weight-bold"
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
          <Field
            name="description"
            component={ Input }
            type="textarea"
            rows="3"
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
          <Field
            name="repository"
            placeholder="https://osf.io/... / https://github.com/..."
            component={ Input }
            bsSize="sm"
            className="text-monospace"
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
          <Field
            name="contributors"
            placeholder="Rita Levi-Montalcini &lt;rlm@nobel.example&gt; (http://ibcn.cnr.it)"
            component={ Input }
            type="textarea" rows="3"
            bsSize="sm" className="text-monospace"
          />
          <FormText color="muted">
            <em>One line each, please!</em> To keep things tidy, please enter full names (or secret pseudonyms) for everyone who helped build this study. You can also add an email address (in angle brackets) and a link (in round brackets).
          </FormText>
        </Col>
      </FormGroup>
      <AutoSave
        onSave={
          data => updateComponent('root', { metadata: data })
        }
      />
    </form>
  </Formik>

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
