import React from 'react'

import { Nav, NavItem, NavLink } from 'reactstrap'
import classnames from 'classnames'

export default class TabSet extends React.Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)

    this.state = {
      activeTab: props.activeTab
    }
  }

  toggle(tab) {
    if (tab !== this.state.activeTab) {
      this.setState({ activeTab: tab })
    }
  }

  render() {
    return (
      <div>
        <Nav tabs>
          {
            Object.keys(this.props.tabs).map(tab =>
              <NavItem key={ tab }>
                <NavLink
                  href="#"
                  className={classnames({
                    active: this.state.activeTab === tab
                  })}
                  onClick={() => { this.toggle(tab); }}
                >
                  { tab }
                </NavLink>
              </NavItem>
            )
          }
        </Nav>
        {
          this.props.tabs[this.state.activeTab]()
        }
      </div>
    )
  }
}
