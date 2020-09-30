import React, { Component, createRef, forwardRef } from 'react'
import { ReactReduxContext } from 'react-redux'
import { findDOMNode } from 'react-dom'

import { Formik, Field, Form } from 'formik'
import { Input } from '../../../Form'

import { FormGroup, Label, FormText,
  Nav, NavItem,  NavLink } from 'reactstrap'
import Icon from '../../../Icon'

import exportStaticNetlify from '../../../../logic/io/export/modifiers/netlify'

// Validation
const validateApiKey = value => {
  if (!value) {
    return 'We\'ll need a API key to upload the study'
  } else if (![64, 43].includes(value.length)) {
    return 'The keys are typically 43 or 64 characters long'
  }
}

const NetlifyForm = forwardRef(({ onSubmit }, ref) =>
  <Formik
    initialValues={{ site: '', apiKey: '' }}
    onSubmit={ onSubmit }
  >
    {({ errors, touched }) => (
      <Form ref={ ref }>
        <FormGroup>
          <Label for="site">
            Study domain/site{' '}
            <small className="text-muted">(optional)</small>
          </Label>
          <Field
            name="site" id="site"
            placeholder="random-domain-name.netlify.com"
            component={ Input }
            className="text-monospace"
          />
          <FormText color="muted">
            If you've previously created <a href="https://app.netlify.com/account/sites" target="_blank" rel="noopener noreferrer">a site for your study</a>, you can enter the domain here. Leave empty to create a new site with a preliminary domain name.
          </FormText>
        </FormGroup>
        <FormGroup>
          <Label for="apiKey">API access code</Label>
          <Field
            name="apiKey" id="apiKey"
            component={ Input }
            className="text-monospace"
            validate={ validateApiKey }
          />
          { errors.apiKey && touched.apiKey &&
            <FormText color="danger">{ errors.apiKey }</FormText> }
          <FormText color="muted">
            You'll need to <a href="https://app.netlify.com/account/applications"  target="_blank" rel="noopener noreferrer">create an API token</a> or enter an existing one. We don't save or share this information, so make sure to jot it down!
          </FormText>
        </FormGroup>
      </Form>
    )}
  </Formik>
)

class NetlifyWidget extends Component {
  static contextType = ReactReduxContext

  constructor() {
    super()
    this.state = {
      widgetState: 'form'
    }
    this.formRef = createRef()
  }

  triggerSubmit() {
    findDOMNode(this.formRef.current).requestSubmit()
  }

  async send(data) {
    this.setState({ widgetState: 'submitting' })

    // If a site has been specified, deploy to it,
    // otherwise create a new site with a random URL
    const url = data.site
      ? `https://api.netlify.com/api/v1/sites/${ data.site }/deploys`
      : 'https://api.netlify.com/api/v1/sites'

    const studyBlob = await exportStaticNetlify(
      this.context.store.getState(),
      { site: data.site },
    )

    try {
      const r = await fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/zip',
          'Authorization': `Bearer ${ data.apiKey }`,
        },
        body: studyBlob,
      })

      // Transmission succeeded
      if (r.ok) {
        // Response 2xx
        const d = await r.json()

        this.setState({
          widgetState: 'done',
          site_url: d.ssl_url
            || `https://${ d.subdomain }.netlify.com/`,
          admin_url: d.admin_url
            || `https://app.netlify.com/sites/${ d.subdomain }/`,
          statusCode: r.status,
          statusText: r.statusText,
        })
      } else {
        // Non-2xx response
        this.setState({
          widgetState: 'error',
          statusCode: r.status,
          statusText: r.statusText,
        })
      }
    } catch (error) {
      this.setState({
        widgetState: 'error_transmission',
        statusCode: undefined,
        statusText: undefined,
      })
      console.log('transmission error', error)
    }
  }

  render() {
    switch(this.state.widgetState) {
      case 'submitting':
        return <div className="text-center">
          <Icon icon="spinner-third" className="fa-spin" />
        </div>
      case 'done':
        return <>
          <p>
            <strong className="text-success">Uploaded study.</strong> The final deployment is now in the hands of Netlify, and may take a few moments to complete.
          </p>
          <Nav vertical>
            <NavItem>
              <NavLink
                href={ this.state.site_url }
                target="_blank"
                rel="noopener noreferrer"
              >
                Open study
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href={ this.state.admin_url }
                target="_blank"
                rel="noopener noreferrer"
              >
                Site settings
              </NavLink>
            </NavItem>
          </Nav>
        </>
      case 'error':
        return <p>
          <strong className="text-warning">Something went wrong.</strong> We got an error <code>{ this.state.statusCode }</code>, which means { this.state.statusText }. Please take a look at your <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer">Dashboard</a> for more detailed information.
        </p>
      case 'error_transmission':
        return <p>
          <strong className="text-danger">Something went wrong.</strong> We can't tell exactly what happened, but the transfer of the study to Netlify was cancelled. Could you check your login credentials? Otherwise please take a look at your <a href="https://app.netlify.com"  target="_blank" rel="noopener noreferrer">Dashboard</a> for more detailed information.
        </p>
      default:
        return <NetlifyForm
          ref={ this.formRef }
          onSubmit={ data => this.send(data) }
        />
    }
  }
}

export default NetlifyWidget
