import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'

import { LocalForm, Control, Errors } from 'react-redux-form'
import { FormGroup, Label, Input, FormText,
  Nav, NavItem,  NavLink } from 'reactstrap'

import exportStaticNetlify from '../../../../logic/io/export/modifiers/netlify'

// Validators
const required = v => v && v.length
const length = len => v => !v || v.length === len

const NetlifyForm = ({ formRef, onSubmit }) =>
  <LocalForm
    ref={ formRef }
    onSubmit={ onSubmit }
  >
    <FormGroup>
      <Label for="site">
        Study domain/site{' '}
        <small className="text-muted">(optional)</small>
      </Label>
      <Control
        model=".site" id="site"
        component={ Input }
        placeholder="random-domain-name.netlify.com"
        style={{
          fontFamily: 'Fira Code',
        }}
      />
      <FormText color="muted">
        If you've previously created <a href="https://app.netlify.com/account/sites" target="_blank" rel="noopener noreferrer">a site for your study</a>, you can enter the domain here. Leave empty to create a new site with a preliminary domain name.
      </FormText>
    </FormGroup>
    <FormGroup>
      <Label for="apiKey">API access code</Label>
      <Control
        model=".apiKey" id="apiKey"
        component={ Input }
        style={{
          fontFamily: 'Fira Code',
        }}
        validators={{ required, length: length(64) }}
        validateOn='change'
      />
      <Errors
        model="local.apiKey"
        component={ props =>
          <FormText color="danger">{ props.children }</FormText> }
        messages={{
          required: 'We\'ll need a API key to upload the study',
          length: 'The keys are typically 64 characters long',
        }}
        show={ (field) => (field.touched || field.submitted) }
      />
      <FormText color="muted">
        You'll need to <a href="https://app.netlify.com/account/applications"  target="_blank" rel="noopener noreferrer">create an API token</a> or enter an existing one. We don't save or share this information, so make sure to jot it down!
      </FormText>
    </FormGroup>
  </LocalForm>

class NetlifyWidget extends Component {
  constructor() {
    super()
    this.state = {
      widgetState: 'form'
    }
  }

  attachForm(form) {
    this._form = findDOMNode(form)
    window.foo = this._form
  }

  triggerSubmit() {
    this._form.submit()
  }

  send(data) {
    this.setState({ widgetState: 'submitting' })

    // If a site has been specified, deploy to it,
    // otherwise create a new site with a random URL
    const url = data.site
      ? `https://api.netlify.com/api/v1/sites/${ data.site }/deploys`
      : 'https://api.netlify.com/api/v1/sites'

    return exportStaticNetlify(
      this.context.store.getState(),
      { site: data.site },
    )
      .then(studyBlob => fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/zip',
          'Authorization': `Bearer ${ data.apiKey }`,
        },
        body: studyBlob,
      })).then(r => {
        // Transmission succeeded
        if (r.ok) {
          // Response 2xx
          r.json().then(
            d => this.setState({
              widgetState: 'done',
              site_url: d.ssl_url
                || `https://${ d.subdomain }.netlify.com/`,
              admin_url: d.admin_url
                || `https://app.netlify.com/sites/${ d.subdomain }/`,
              statusCode: r.status,
              statusText: r.statusText,
            })
          )
        } else {
          // Non-2xx response
          this.setState({
            widgetState: 'error',
            statusCode: r.status,
            statusText: r.statusText,
          })
        }
      }).catch(
        e => this.setState({
          widgetState: 'error_transmission',
          statusCode: undefined,
          statusText: undefined,
        })
      )
  }

  render() {
    switch(this.state.widgetState) {
      case 'submitting':
        return <div className="text-center">
          <i className="fas fa-spinner-third fa-spin" />
        </div>
      case 'done':
        return <div>
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
        </div>
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
          formRef={ form => this.attachForm(form) }
          onSubmit={ data => this.send(data) }
        />
    }
  }
}

NetlifyWidget.contextTypes = {
  store: PropTypes.object
}

export default NetlifyWidget
