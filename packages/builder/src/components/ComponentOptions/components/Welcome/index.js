import React, { useState } from 'react'

import { Card, CardHeader, Nav, NavItem, NavLink,
  UncontrolledTooltip } from 'reactstrap'
import classnames from 'classnames'

import Icon from '../../../Icon'

import { NavEntry } from '../../../Nav'
import SplashTab from './components/SplashTab'
import ExampleTab from './components/ExampleTab'

const TabContent = ({ tab, setTab }) => {
  switch(tab) {
    case 'splash':
      return <SplashTab switchTab={ tab => setTab(tab) } />
    case 'examples':
      return <ExampleTab />
    default:
      return <div>Requested tab not found</div>
  }
}

export default () => {
  const [tab, setTab] = useState('splash')

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
            <NavEntry id="splash" activeId={ tab } setId={ setTab }>
              <Icon icon="heart" />
            </NavEntry>
            <NavItem>
              <NavLink
                id="splash-tab-examples"
                className={ classnames({
                  active: tab === 'examples'
                }) }
                onClick={ () => setTab('examples') }
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
        <TabContent tab={ tab } setTab={ setTab } />
      </Card>
    </div>
  )
}
