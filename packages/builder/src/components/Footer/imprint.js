import React from 'react'
import { connect } from 'react-redux'

import { Button } from 'reactstrap'

import Hint from '../Hint'
import Icon from '../Icon'

const HelpHint = () =>
  <Hint
    target={ ({ id, onClick }) =>
      <span id={ id } onClick={ onClick } style={{ cursor: 'pointer' }}>
        Help
      </span>
    }
    title="Finding help"
  >
    <p className="mt-1">
      <strong>We would love to help you build your research!</strong>{' '}
      Here are some resources to get you started and assist you while you're using <code>lab.js</code>:
    </p>
    <p>
      The <a className="font-weight-bold" target="_blank" rel="noopener noreferrer" href="https://labjs.readthedocs.io">online documentation</a> provides tutorials, useful tricks, and detailed technical reference. It is probably the best place to gain an overview.
    </p>
    <p>
      You're always welcome to <a className="font-weight-bold" target="_blank" rel="noopener noreferrer" href="https://slackin-nmbrcrnchrs.herokuapp.com/">join the project chat</a>, where fellow users will answer questions and help you get unstuck. If you can, please pay it forward by helping in turn.
    </p>
    <p>
      You've probably already spotted the <Icon icon="info-circle" className="text-muted" /> symbols in the interface; they provide further <strong>contextual information</strong>, which you can access by clicking on them.
    </p>
    <p>
      As always, if something isn't working as you'd expect, please <a target="_blank" rel="noopener noreferrer" href="https://labjs.readthedocs.io/en/latest/meta/contribute/ways.html">let us know</a>!
    </p>
  </Hint>

const _ImprintHint = ({ showModal }) =>
  <Hint
    target={ ({ id, onClick }) =>
      <span id={ id } onClick={ onClick } style={{ cursor: 'pointer' }}>
        Imprint
      </span>
    }
    title="Imprint"
  >
    <p>
      <strong>Thank you for using <a href="https://felixhenninger.github.io/lab.js" className="font-weight-bold" target="_blank" rel="noopener noreferrer"><code>lab.js</code></a> — <br />It's a pleasure to have you around!</strong><br />
      Here's some information to help keep our lawyers happy, too.
    </p>
    <h6>Authors</h6>
    <p>
      This software is developed by <a href="http://felixhenninger.com" target="_blank" rel="noopener noreferrer">Felix Henninger</a>, with help from many awesome <a href="https://github.com/felixhenninger/lab.js#contributors" target="_blank" rel="noopener noreferrer">contributors</a>. Felix is a member of the <a href="https://www.cognition.uni-landau.de/" target="_blank" rel="noopener noreferrer">University of Landau Cognition Lab</a> and a student at the <a href="http://gess.uni-mannheim.de/">University of Mannheim</a>.
    </p>
    <Button
      size="sm" block
      color="primary" outline
      className="mb-2"
      onClick={ () => showModal('LEGAL', { large: 'true' }) }
    >
      Legal
    </Button>
  </Hint>

const mapDispatchToProps = {
  showModal: (modalType, modalProps) => ({
    type: 'SHOW_MODAL',
    modalType, modalProps,
  })
}

const ImprintHint = connect(null, mapDispatchToProps)(_ImprintHint)

export const Imprint = () =>
  <small className="text-muted">
    <HelpHint /> ·{' '}
    <ImprintHint />
  </small>

