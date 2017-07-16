export const addDebugPlugin = (state) => {
  // Add debug plugin to root component
  state.components.root.plugins = [
    ...state.components.root.plugins,
    { type: 'lab.plugins.Debug' },
  ]

  return state
}
