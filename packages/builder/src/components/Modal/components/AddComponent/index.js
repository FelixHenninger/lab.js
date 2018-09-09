import React, { Component } from 'react'

import { Button, ModalBody, ModalFooter, Nav, NavItem, NavLink } from 'reactstrap'
import classnames from 'classnames'

import Icon from '../../../Icon'

import NewTab from './components/newTab'
import CopyTab from './components/copyTab'
import TemplateTab from './components/templateTab'
import ImportTab from './components/importTab'

class AddComponentModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeTab: 'new'
    }
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      })
    }
  }

  tabContent() {
    const { parent, index } = this.props
    switch(this.state.activeTab) {
      case 'new':
        return <NewTab
          parent={ parent }
          index={ index }
        />
      case 'copy':
        return <CopyTab
          parent={ parent }
          index={ index }
        />
      case 'template':
        return <TemplateTab
          parent={ parent }
          index={ index }
        />
      case 'import':
        return <ImportTab
          parent={ parent }
          index={ index }
        />
      default:
        return <div>Requested tab not found</div>
    }
  }

  render() {
    const { closeHandler } = this.props
    return <div className="modal-content">
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === 'new' })}
            onClick={() => { this.toggle('new'); }}
          >
            <Icon icon="plus" weight="s" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === 'copy' })}
            onClick={() => { this.toggle('copy'); }}
          >
            <Icon icon="clone" fallbackWeight="r" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === 'template' })}
            onClick={() => { this.toggle('template'); }}
          >
            <Icon icon="rocket" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === 'import' })}
            onClick={() => { this.toggle('import'); }}
          >
            <Icon icon="folder-open" fallbackWeight="r" />
          </NavLink>
        </NavItem>
        <NavItem
          className="ml-auto"
          style={{
            padding: '0.25em 0',
          }}
        >
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={ closeHandler }
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </NavItem>
      </Nav>
      <ModalBody>
        { this.tabContent() }
      </ModalBody>
      <ModalFooter>
        <Button
          outline color="secondary"
          onClick={ closeHandler }
          >
          Cancel
        </Button>
      </ModalFooter>
    </div>
  }
}

export default AddComponentModal
