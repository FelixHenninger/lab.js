const unloadHandler = (e) => {
  const warning =
    'Closing this window will abort the study. ' +
    'Are you sure?'
  e.returnValue = warning
  return warning
}

export default class NavigationGuard {
  handle(_, event) {
    if (event === 'prepare') {
      window.addEventListener('beforeunload', unloadHandler)
    } else if (event === 'end') {
      window.removeEventListener('beforeunload', unloadHandler)
    }
  }
}
