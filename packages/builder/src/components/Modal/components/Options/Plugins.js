import React from 'react'

import { Formik } from 'formik'

import { AutoSave } from '../../../Form'
import { Table } from '../../../Form/table'
import { updateComponent } from '../../../../actions/components'
import { connect } from 'react-redux'

import { PluginRow, PluginFooter } from '../../../ComponentOptions/components/Plugins'

const Plugins = ({ plugins, updateComponent }) =>
  <Formik
    initialValues={{ plugins }}
  >
    <form>
      <h4 className="mt-1">
        Plugins
      </h4>
      <p className="text-muted">
        Any plugins you define here will be active throughout the entire study.
      </p>
      <Table
        name="plugins"
        row={ PluginRow }
        footer={ PluginFooter }
        className="no-header"
      />
      <AutoSave
        onSave={
          data => updateComponent('root', { plugins: data.plugins })
        }
      />
    </form>
  </Formik>

const mapStateToProps = state => ({
  plugins: state.components['root'].plugins
})
const mapDispatchToProps = {
  updateComponent
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Plugins)
