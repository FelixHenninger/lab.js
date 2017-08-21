import React from 'react'
import { FormGroup } from 'reactstrap'
import { Control } from 'react-redux-form'

import Card from '../../Card'
import Form from './Form'

export default ({ id, data }) =>
  <Card title="Notes">
    <Form
      id={ id }
      data={ data }
      keys={ ['notes'] }
    >
      <FormGroup>
        <Control.textarea
          model=".notes"
          className="form-control form-control-sm"
          placeholder="Notes"
          rows="10"
          style={{
            padding: '0.5rem 0.75rem',
          }}
          debounce={ 300 }
        />
      </FormGroup>
    </Form>
  </Card>
