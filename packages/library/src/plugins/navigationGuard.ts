const unloadHandler = (e: any) => {
  const warning =
    'Closing this window will abort the study. ' +
    'Are you sure?'
  e.returnValue = warning
  return warning
}

export default class NavigationGuard {
  handle(_: any, event: any) {
    if (event === 'prepare') {
      window.addEventListener('beforeunload', unloadHandler)
    } else if (event === 'end') {
      window.removeEventListener('beforeunload', unloadHandler)
    }
  }
}
