import React, { useState } from 'react'
import { useStore } from 'react-redux'

import { Container, Row, Col, Alert, Button, ButtonGroup } from 'reactstrap'
import { sample } from 'lodash'

import { stateToDownload } from '../../logic/io/save'
import Card from '../Card'

// Source: https://en.wiktionary.org/wiki/Category:English_minced_oaths
// and https://en.wiktionary.org/wiki/Appendix:Fictional_English_curse_words
const mincedOaths = [
  'Well, crikey',
  'Dangnabbit!',
  'What the cabbage?',
  'What a total cluster-cuss.', // 🦊
  'Belgium!', // 🇧🇪
]

const gifs = [
  'https://media.giphy.com/media/XsUtdIeJ0MWMo/giphy.mp4', // Picard facepalm
  'https://media.giphy.com/media/155lQxHOx9Bni/giphy.mp4', // Hermione slow clap
  'https://media.giphy.com/media/FYenMRUx3LGy4/giphy.mp4', // McG disapproval
  'https://media.giphy.com/media/p3RblYx4T7vmU/giphy.mp4', // Dumbledore shrugs
  'https://media.giphy.com/media/8QIgBwVvZVrG0/giphy.mp4', // Ford?
  'https://media.giphy.com/media/pPhyAv5t9V8djyRFJH/giphy.mp4', // Obama
  'https://media.giphy.com/media/APqEbxBsVlkWSuFpth/giphy.mp4', // Seems fishy
  'https://media.giphy.com/media/Rhkq4ehWqVX56/giphy.mp4', // Sheldon Cooper I
  'https://media.giphy.com/media/fOVGTYyYtV6Ra/giphy.mp4', // Sheldon Cooper II
]

const Error = ({ reset, error, errorInfo, eventId }) => {
  const [backup, setBackup] = useState(false)

  // TODO: This is not (yet) canonical redux: The component is still
  // accessing the store directly, for instance to dispatch actions.
  // This should be refactored to use action creators in the mid-term.
  const store = useStore()

  return (
    <Container>
      <Row>
        <Col
          sm={{ size: 4, offset: 4 }}
          className="text-center my-4"
        >
          <video
            autoPlay loop
            className="rounded-circle shadow"
            style={{
              width: '300px',
              height: '300px',
              marginTop: '10vh',
              objectFit: 'cover',
            }}
          >
            <source
              src={ sample(gifs) }
              type="video/mp4"
            />
          </video>
        </Col>
      </Row>
      <Row>
        <Col sm={{ size: 6, offset: 3 }}>
          <Alert color="danger" className="my-4">
            <h4 className="alert-heading mt-2">
              { sample(mincedOaths) }
            </h4>
            <hr />
            <p className="mb-1">
              <strong>We're really, really sorry, something just went badly wrong.</strong> In a nutshell, <code>lab.js</code> encountered an error it couldn't recover from, and the application can't run or restart. The team has been alerted.
            </p>
          </Alert>
          <Alert color="light" style={{ background: 'white', border: 'none' }}>
            <p><strong>We want to help you get back to work as quickly as possible.</strong> Here are a few things to speed up that process:</p>
            <p>First of all, please make sure you <strong>download a backup</strong> of the study you've been working on. We can almost certainly help you recover your last change, even if the file doesn't load.</p>
            <Button
              outline color="primary"
              block size="lg"
              onClick={ e => {
                stateToDownload(store.getState())
                setBackup(true)
              } }
            >
              Download study backup
            </Button>
            <p className="mt-3"><strong>With the backup in hand, you're safe for the moment.</strong> Please <a target="_blank" rel="noopener noreferrer" href="https://lab.js.org/resources/support/"> join the support channel</a> where we would be happy to help you track down and fix the bug. We make mistakes sometimes, but also love to learn how we can improve things, and would be glad to make things better for everyone!</p>
            <p>There are two more things you can try. <strong>We recommend to only attempt these in consultation with support.</strong> You'll need to download a backup of your current study first.</p>
            <ButtonGroup className="w-100">
              <Button
                outline className="w-50 py-3"
                disabled={ !backup }
                onClick={ () => {
                  store.dispatch({
                    type: 'SHOW_COMPONENT_DETAIL',
                    id: undefined,
                  })
                  reset()
                } }
              >
                Close currently<br />
                open component
              </Button>
              <Button
                outline className="w-50 py-3"
                disabled={ !backup }
                onClick={ () => {
                  const warning = 'This will discard the currently active study. Are you sure?'

                  if (window.confirm(warning)) {
                    store.dispatch({ type: 'RESET_STATE' })
                  }
                  reset()
                } }
              >
                Start from scratch<br />
                with an empty study
              </Button>
            </ButtonGroup>
            <Card
              title="Guru meditation / technical details"
              className="mt-3"
              collapsable={ true }
              open={ false }
            >
              <dl>
                <dt>Error message</dt>
                <dd>{ (error && error.toString()) || <em>(unavailable)</em> }</dd>
                <dt>Component stack</dt>
                <dd style={{ whiteSpace: "pre-wrap" }}>
                  { errorInfo.componentStack || <em>(unavailable)</em> }
                </dd>
                <dt>EventId</dt>
                <dd>{ eventId || <em>(unavailable)</em> }</dd>
              </dl>
            </Card>
          </Alert>
        </Col>
      </Row>
    </Container>
  )
}

Error.defaultProps = {
  error: undefined,
  errorInfo: {},
}

export default Error
