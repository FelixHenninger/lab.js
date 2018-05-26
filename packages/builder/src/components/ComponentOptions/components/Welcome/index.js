import React, { Component } from 'react'

import { Card, CardHeader, Nav, NavItem, NavLink,
  UncontrolledTooltip } from 'reactstrap'
import classnames from 'classnames'

import Icon from '../../../Icon'

import SplashTab from './components/SplashTab'
import ExampleTab from './components/ExampleTab'

class WelcomeCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeTab: 'splash'
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
    switch(this.state.activeTab) {
      case 'splash':
        return <SplashTab switchTab={ tab => this.toggle(tab) } />
      case 'examples':
        return <ExampleTab />
      default:
        return <div>Requested tab not found</div>
    }
  }

  render() {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Card
          style={{ width: '500px' }}
        >
          <CardHeader>
            <Nav tabs className="card-header-tabs justify-content-center">
              <NavItem>
                <NavLink
                  className={classnames({
                    active: this.state.activeTab === 'splash'
                  })}
                  onClick={() => { this.toggle('splash') }}
                >
                  <Icon icon="heart" />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  id="splash-tab-examples"
                  className={classnames({
                    active: this.state.activeTab === 'examples'
                  })}
                  onClick={() => { this.toggle('examples') }}
                >
                  <Icon icon="rocket" />
                </NavLink>
                <UncontrolledTooltip
                  target="splash-tab-examples"
                  placement="bottom"
                  delay={{ show: 0, hide: 100 }}
                >
                  {/* TODO: Reduce the offset of the tooltips, around 8-10px,
                      as soon as the option is available via reactstrap */}
                  Examples
                </UncontrolledTooltip>
              </NavItem>
            </Nav>
          </CardHeader>
          { this.tabContent() }
        </Card>
      </div>
    )
  }
}

export default WelcomeCard
