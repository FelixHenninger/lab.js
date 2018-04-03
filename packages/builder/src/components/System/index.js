import React from 'react'

// Create context for system state
export const SystemContext = React.createContext({
  previewState: undefined
})

export const SystemContextProvider = ({ value, children }) =>
  <SystemContext.Provider value={ value }>
    { children }
  </SystemContext.Provider>
