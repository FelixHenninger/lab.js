export const setupTestingContext = () => {
  beforeEach(() => {
    const el = document.createElement('div')
    el.dataset['labjsSection'] = 'main'
    document.body.appendChild(el)
  })

  afterEach(() => {
    const el = document.querySelector('[data-labjs-section="main"]')
    document.body.removeChild(el!)
  })
}
