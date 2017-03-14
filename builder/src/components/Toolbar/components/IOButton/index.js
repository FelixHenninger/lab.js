import React, { Component } from 'react'
import { Button, ButtonDropdown,
  DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

import UploadItem from './UploadItem'
import { fromJSON } from '../../../../logic/io/load'
import { stateToDownload } from '../../../../logic/io/save'
import { exportStatic } from '../../../../logic/io/export'

class IOButton extends Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.state = {
      dropdownOpen: false
    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    })
  }

  render() {
    return (
      <ButtonDropdown isOpen={ this.state.dropdownOpen } toggle={ this.toggle }>
        <Button id="caret"
          onClick={ () => stateToDownload(this.context.store.getState()) }
        >
          <i className="fa fa-save" aria-hidden="true"></i>
        </Button>
        <DropdownToggle caret split/>
        <DropdownMenu>
          <DropdownItem header>Study</DropdownItem>
          <DropdownItem
            onClick={() => {
              if (window.confirm('Do you really want to reset the study?')) {
                this.context.store.dispatch({ type: 'RESET_STATE' })
                this.context.store.dispatch({ type: 'SHOW_COMPONENT_DETAIL', id: null })
              }
            }}
          >
            New
          </DropdownItem>
          <UploadItem
            accept="application/json"
            maxSize={ 1024 ** 2 }
            onUpload={
              // TODO: This smells like it should
              //   be extracted and abstracted
              fileContents => {
                try {
                  // Parse file from JSON
                  const state = fromJSON(fileContents)
                  // Hydrate store from resulting object
                  this.context.store.dispatch({
                    type: 'HYDRATE', state,
                  })
                } catch(e) {
                  // If things don't work out, let the user know
                  alert('Couldn\'t load file, found error', e)
                }
              }
            }
          />
          <DropdownItem
            onClick={
              () => stateToDownload(this.context.store.getState())
            }
          >
            Save
          </DropdownItem>
          <DropdownItem divider/>
          <DropdownItem header>Export as bundle</DropdownItem>
          <DropdownItem
            onClick={ () => exportStatic(this.context.store.getState()) }
          >
            Plain <span className="text-muted">(no backend)</span>
          </DropdownItem>
          <DropdownItem disabled>
            PHP backend
          </DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
    )
  }
}

IOButton.contextTypes = {
  store: React.PropTypes.object
}

export default IOButton
