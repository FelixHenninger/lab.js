import React from 'react'
import { connect } from 'react-redux'

import { Nav, NavItem, NavLink,
  FormGroup, InputGroup, InputGroupAddon,
  UncontrolledTooltip } from 'reactstrap'

import { Formik, Field } from 'formik'
import { AutoSave, Input } from '../Form'

import classnames from 'classnames'

import Icon from '../Icon'
import { updateComponent } from '../../actions/components'
import { metadata, defaultTab } from '../../logic/components'

const tabIcons = {
  'Files': 'folder',
  'Parameters': 'box-open',
  // 'Scripts': 'fa-code', // TODO: This doesn't feel right atm
  'Plugins': 'plug',
  'More': 'ellipsis-h',
}

const HeaderForm = ({ title, typeCategory, typeName, template,
  icon, iconWeight, iconFallbackWeight, onChange }) =>
  <Formik
    initialValues={{ title }}
    enableReinitialize={ true }
  >
    <FormGroup
      className="mr-sm-2"
      style={{ width: '40%' }}
    >
      <InputGroup>
        <Field
          name="title"
          component={ Input }
          bsSize="lg"
          className="font-weight-bold"
          style={{
            padding: '0.5rem 0.75rem',
            height: '42px',
          }}
        />
        <InputGroupAddon addonType="append">
          <span className="input-group-text">
            <Icon
              id="typeIcon"
              icon={ icon }
              fixedWidth
              weight={ iconWeight }
              fallbackWeight={ iconFallbackWeight }
            />
          </span>
          <UncontrolledTooltip placement="right" target="typeIcon">
            {
              template
              ? 'Template'
              : <span>
                  { typeName }
                  <span className="text-muted"> · { typeCategory }</span>
                </span>
            }
          </UncontrolledTooltip>
        </InputGroupAddon>
      </InputGroup>
      <AutoSave onSave={ data => onChange(data) } />
    </FormGroup>
  </Formik>

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
            minWidth: '2.8rem',
            textAlign: 'center',
          }}
          onClick={
            () => onChange(t)
          }
        >
          {
            tabIcons[t]
              ? <Icon icon={ tabIcons[t] } weight="s" fixedWidth />
              : t
          }
        </NavLink>
      </NavItem>
    )
  } </Nav>

const Header = ({ id, type, title, tab, template, updateComponent }) => {
  // Only show content if a valid id is provided
  if (id) {
    const visibleTabs = metadata[type].tabs
      .filter(t => !template || t === tab || ['Parameters', 'More'].includes(t))

    return <div className="d-flex justify-content-between">
      <HeaderForm
        id={ id }
        title={ title }
        typeName={ metadata[type].name }
        typeCategory={ metadata[type].category }
        template={ template }
        icon={ template ? 'box-open' : metadata[type].icon }
        iconWeight={ metadata[type].iconWeight }
        iconFallbackWeight={ metadata[type].iconFallbackWeight }
        onChange={ data => updateComponent(id, data) }
      />
      <HeaderNav
        tabs={ visibleTabs }
        tab={ tab }
        onChange={ _tab => updateComponent(id, { _tab }) }
      />
    </div>
  } else {
    return null
  }
}

const mapStateToProps = state => {
  const id = state.componentDetail.viewProps.id

  // Check whether the corresponding component exists
  if (state.components[id]) {
    const { type, title, _tab: tab, _template: template } =
      state.components[id]
    return {
      key: id, id,
      type, title, template,
      tab: defaultTab(tab, type),
    }
  } else {
    return {
      id: undefined
    }
  }
}

const mapDispatchToProps = {
  updateComponent,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)
