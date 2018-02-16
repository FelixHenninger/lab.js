import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Confirm from '../Confirm'

class ExternalContent extends Component {
  constructor(props) {
    super(props)
    this.url = props.url
    this.state = { state: 'empty', content: '' }
  }

  componentDidMount() {
    fetch(this.url)
      .then(response => response.text())
      .then(content => this.setState({ state: 'loaded', content, }) )
      .catch(() => this.setState({ state: 'error' }) )
  }

  render() {
    return <div dangerouslySetInnerHTML={{ __html: this.state.content }}></div>
  }
}

const Legal = ({ closeHandler }, { store }) =>
  <Confirm
    title={ <span>Legal</span> }
    closeLabel="Done"
    closeHandler={ closeHandler }
  >
    <ExternalContent url="/content/legal.html" />
  </Confirm>

Legal.contextTypes = {
  store: PropTypes.object
}

export default Legal
