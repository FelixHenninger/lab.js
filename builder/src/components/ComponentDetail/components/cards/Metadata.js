import React from 'react'
import Card from '../../../Card'
import { FormGroup } from 'reactstrap'
import { Control } from 'react-redux-form'

export default (props) =>
  <Card title="Metadata" { ...props }>
    <FormGroup>
      <Control
        model=".title"
        placeholder="Title"
        className="form-control form-control-lg"
        style={{
          fontWeight: 'bold',
          padding: '0.5rem 0.75rem',
        }}
        />
    </FormGroup>
    <FormGroup>
      <Control.textarea
        model=".notes"
        className="form-control form-control-sm"
        placeholder="Notes"
        rows="2"
        style={{
          padding: '0.5rem 0.75rem',
        }}
        />
    </FormGroup>
  </Card>
