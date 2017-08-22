import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { Nav, NavItem, NavLink,
  FormGroup, InputGroup, InputGroupAddon,
  UncontrolledTooltip } from 'reactstrap'
import { LocalForm, Control } from 'react-redux-form'
import classnames from 'classnames'

import { updateComponent } from '../../actions/components'
import { metadata, defaultTab } from '../../logic/components'

const HeaderForm = ({ title, typeCategory, typeName, icon, onChange }) =>
  <LocalForm
    initialState={{ title }}
    onChange={ data => onChange(data) }
    style={{ width: '40%' }}
  >
    <FormGroup
      className="mr-sm-2"
    >
      <InputGroup>
        <Control
          model="local.title"
          placeholder="Title"
          className="form-control form-control-lg"
          style={{
            fontWeight: '500',
            padding: '0.5rem 0.75rem',
            height: '42px',
          }}
          debounce={ 250 }
        />
        <InputGroupAddon>
          <i
            id="typeIcon"
            className={`fa fa-${ icon }`}
            style={{
              textAlign: 'center',
              minWidth: '20px',
            }}
          />
          <UncontrolledTooltip placement="right" target="typeIcon">
            { typeName }
            <span className="text-muted"> · { typeCategory }</span>
          </UncontrolledTooltip>
        </InputGroupAddon>
      </InputGroup>
    </FormGroup>
  </LocalForm>

const HeaderNav = ({ tabs, tab, onChange }) =>
  <Nav pills> {
    tabs.map(t =>
      <NavItem key={ t }>
        <NavLink
          href="#"
          className={ classnames({
            active: tab === t
          }) }
          style={{
            height: '42px',
            padding: '9px 16px 7px',
          }}
          onClick={
            () => onChange(t)
          }
        >
          { t }
        </NavLink>
      </NavItem>
    )
  } </Nav>

const Header = ({ id, type, title, tab }, { store }) => {
  // Only show content if a valid id is provided
  if (id) {
    return <div className="d-flex justify-content-between">
      <HeaderForm
        id={ id }
        title={ title }
        typeName={ metadata[type].name }
        typeCategory={ metadata[type].category }
        icon={ metadata[type].icon }
        onChange={ data => store.dispatch(updateComponent(id, data)) }
      />
      <HeaderNav
        tabs={ metadata[type].tabs }
        tab={ tab }
        onChange={ _tab => store.dispatch(updateComponent(id, { _tab })) }
      />
    </div>
  } else {
    return null
  }
}

Header.contextTypes = {
  store: PropTypes.object
}

export default connect(
  (state, props) => {
    const id = state.componentDetail.viewProps.id

    // Check whether the corresponding component exists
    if (state.components[id]) {
      const { type, title, _tab: tab } = state.components[id]
      return {
        key: id, id,
        type, title,
        tab: defaultTab(tab, type),
      }
    } else {
      return {
        id: undefined
      }
    }
  }
)(Header)
