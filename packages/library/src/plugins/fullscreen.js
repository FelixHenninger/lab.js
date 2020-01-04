export default class FullscreenPlugin {
  constructor({ message, hint, close }) {
    this.options = {
      message: message || 'This experiment requires full screen display',
      hint: hint || 'Please click to continue in full screen mode',
      close: close ?? true,
    }
  }

  async handle(context, event) {
    if (event === 'before:run' && !document.fullscreenElement) {
      // Create and show overlay (sorry Merle, no Alpacas here :-/ )
      const overlay = document.createElement('div')
      overlay.innerHTML = `
        <div
          class="modal w-m content-horizontal-center content-vertical-center text-center"
        >
          <p>
            <span class="font-weight-bold">
              ${ this.options.message }
            </span><br>
            <span class="text-muted">
              ${ this.options.hint }
            </span>
          </p>
        </div>
      `
      overlay.classList.add(
        'overlay',
        'content-vertical-center',
        'content-horizontal-center'
      )
      document.body.appendChild(overlay)

      // Halt all activity until confirmation of the fullscreen switch
      await new Promise(resolve => {
        overlay.addEventListener('click', async e => {
          await lab.util.fullscreen.launch(document.documentElement)
          document.body.removeChild(overlay)
          resolve()
        }, { once: true })
      })
    } else if (event === 'end' && this.options.close) {
      lab.util.fullscreen.exit()
    }
  }
}
