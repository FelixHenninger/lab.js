import React from 'react'
import * as Sentry from '@sentry/react'

import Error from './Error'
import Layout from '../Layout'
import ReduxModal from '../Modal/redux'
import Shortcuts from '../Shortcuts'

import Sidebar from '../Sidebar'
import Footer from '../Footer'
import ComponentHeader from '../ComponentHeader'
import ComponentOptions from '../ComponentOptions'

const App = () =>
  <Sentry.ErrorBoundary
    fallback={({ error, componentStack, resetError }) =>
      <Error
        error={ error }
        componentStack={ componentStack }
        resetError={ resetError }
      />
    }
  >
    <Shortcuts />
    <ReduxModal />
    <Layout
      sidebar={ <Sidebar /> }
      footer={ <Footer /> }
    >
      <ComponentHeader />
      <ComponentOptions />
    </Layout>
  </Sentry.ErrorBoundary>

export default App
