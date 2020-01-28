import React, { useState } from 'react'

import { CardBody, CardText,
  Container, Row, Col, Collapse, Badge } from 'reactstrap'
import classnames from 'classnames'
import Icon from '../../../../../Icon'

import './index.css'

const SplashHeader = () =>
  <CardBody
    style={{ textAlign: 'center' }}
  >
    <h2 style={{ margin: '2rem 0 1rem' }} >
      Welcome!
    </h2>
    <CardText className="mb-3">
      <strong>Thank you for using <code>lab.js</code>!</strong><br/>
      We hope you find it useful, and that<br />
      you enjoy using it as much as we did building it.
    </CardText>
  </CardBody>

const SplashTab = ({ icon, children, active,
  borderRight, borderBottom, onClick }) =>
  // This used to use p-4
  <Col
    className={ classnames(
      'splash-tab-icon',
      'pt-4 pb-3', {
      'active': active,
      'border-right': borderRight,
      'border-bottom': borderBottom,
    }) }
    style={{
      cursor: active ? 'default' : 'pointer',
    }}
    onClick={ active ? undefined : onClick }
  >
    <Icon
      icon={ icon }
      className="fa-2x d-block mt-2 mb-3"
    />
    { children }
    <Icon
      icon="angle-down"
      className={ classnames(
        'd-block', (active ? 'visible': 'invisible'),
        'text-muted',
        'mt-1',
      ) }
    />
  </Col>

const SplashButton = ({ icon, onClick, children }) =>
  <Col
    className="pt-3 pb-4"
    style={{
      cursor: 'pointer',
    }}
    onClick={ onClick }
  >
    <Icon
      icon={ icon }
      className="fa-2x d-block mt-2 mb-3"
    />
    { children }
  </Col>

// TODO: This is a bit of a mess, and deserves some
// refactoring in an inspired moment.
const splashOptions = {
  start: {
    title: <p className="mb-1"><strong>Get started</strong></p>,
    icon: 'map',
    content: (switchTab) =>
      <Container><Row className="text-center pt-3 pb-2">
        <SplashButton
          icon="shoe-prints"
          onClick={ () =>
            alert('Sorry, but this isn\'t quite ready yet. Please join us on Slack and we\'d be happy to give you a personal tour!')
          }
        >
          <p className="mb-1">Take a <strong>tour</strong></p>
          <p className="mb-0 text-muted">
            <small>We'd love to<br />show you around!</small>
          </p>
          <Badge>Alpha</Badge>
        </SplashButton>
        <SplashButton
          icon="book-open"
          onClick={ () => window.open(
            'https://lab.js.org/docs/en/latest/learn/builder/',
            '_blank'
          ) }
        >
          <p className="mb-1">Watch the<br /><strong>tutorial</strong></p>
          <p className="mb-0 text-muted">
            <small>... and build a study step by step</small>
          </p>
        </SplashButton>
        <SplashButton
          icon="rocket"
          onClick={ () => switchTab('examples') }
        >
          <p className="mb-1">
            Browse some<br /><strong>examples</strong>
          </p>
        </SplashButton>
      </Row></Container>
  },
  learn: {
    title: <p className="mb-1"><strong>Learn</strong> more</p>,
    icon: 'graduation-cap',
    content: (switchTab) =>
      <Container className="py-4">
        <p><strong>Wow, it's cool that you're interested!</strong> Here are some things we hope you'll find helpful:</p>
        <ul>
          <li>We've collected <a href="https://lab.js.org/docs/en/latest/recipes/" target="_blank" rel="noopener noreferrer">tips, tricks and recipes</a> for common use cases.</li>
          <li>
            Maybe the paradigm you're looking for is already among the{' '}
            <a
              href="#example-tab"
              onClick={ (e) => {
                e.preventDefault()
                switchTab('examples')
              } }
            >examples</a>
            ?
          </li>
          <li>The <a href="https://lab.js.org/docs/en/latest/reference/" target="_blank" rel="noopener noreferrer">reference documentation</a> covers the nitty-gritty library internals.</li>
        </ul>
      </Container>
  },
  support: {
    title: <p className="mb-1">Find <strong>support</strong></p>,
    icon: 'life-ring',
    content: () =>
      <Container className="py-4">
        <p><strong>We'd love to support you!</strong> Please don't hesitate to reach out if there's anything we can do to help, we'd be glad to.</p>
        <p>The easiest way to find help is our <a href="https://lab.js.org/resources/support/" target="_blank" rel="noopener noreferrer"><strong>support channel</strong></a>, where there's usually someone around to chat and provide information. You can <a href="https://lab.js.org/resources/support/" target="_blank" rel="noopener noreferrer">join by providing your email address</a> — you'll receive access in seconds.</p>
        <div className="text-center">
          <Icon icon="heart-circle" />
        </div>
      </Container>
  },
}

const SplashAdditions = ({ switchTab }) => {
  const [tab, setTab] = useState(undefined)

  return <>
    <Container className="border-top text-center">
      <Row>
        {
          Object.entries(splashOptions).map(([k, o], i) =>
            <SplashTab
              key={ `splash-tab-${ k }` }
              icon={ o.icon }
              onClick={ () => setTab(k) }
              active={ tab === k }
              borderRight={ i !== Object.entries(splashOptions).length - 1 }
              borderBottom={
                tab !== undefined && tab !== k
              }
            >
              { o.title }
            </SplashTab>
          )
        }
      </Row>
    </Container>
    <Collapse
      isOpen={ tab !== undefined }
    >
      {
        tab !== undefined
          ? splashOptions[tab].content(switchTab)
          : ''
      }
    </Collapse>
  </>
}

export default ({ switchTab }) =>
  <>
    <SplashHeader />
    <SplashAdditions switchTab={ switchTab } />
  </>
