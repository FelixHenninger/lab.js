import React from 'react'

import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
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
        <Nav pills
          className="justify-content-center"
          style={{
            marginBottom: '15px',
          }}
        >
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
        <TabContent>
          <TabPane>
            { this.props.tabs[this.state.activeTab]() }
          </TabPane>
        </TabContent>
      </div>
    )
  }
}
