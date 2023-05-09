import { Screen } from '../screen'

export const makeProcessEvent =
  (component: Screen) =>
  (
    // Post-process event caught on canvas
    [eventName, filters, selector]: [string, string[], string],
  ) => {
    // TODO: Split multiple selectors
    if (selector && selector.startsWith('@')) {
      // Calculate applied pixel ratio
      const pixelRatio = component.options.devicePixelScaling
        ? window.devicePixelRatio
        : 1

      if (['mouseenter', 'mouseleave'].includes(eventName)) {
        const makeCheckFunc = function (initial = true, rising = true) {
          // Buffer last result
          let lastResult = initial

          // TODO: Specify that the function applies to Canvas Components only
          return function checkFunc(e: Event, context: Screen) {
            if (e instanceof MouseEvent) {
              const checkResult = context.internals.ctx.isPointInPath(
                context.internals.paths[selector.slice(1)],
                e.offsetX * pixelRatio,
                e.offsetY * pixelRatio,
              )

              // Detect edge
              const output = rising
                ? !lastResult && checkResult
                : lastResult && !checkResult

              // Save last result
              lastResult = checkResult

              return output
            } else {
              return false
            }
          }
        }

        const checkFunc =
          eventName == 'mouseenter'
            ? makeCheckFunc(true, true)
            : makeCheckFunc(false, false)

        // Return modified event
        return {
          eventName: 'mousemove',
          filters,
          selector: 'canvas',
          moreChecks: [checkFunc],
        }
      } else {
        // Return modified event
        return {
          eventName,
          filters,
          selector: 'canvas',
          moreChecks: [
            (e: Event) =>
              e instanceof MouseEvent &&
              component.internals.ctx.isPointInPath(
                component.internals.paths[selector.slice(1)],
                e.offsetX * pixelRatio,
                e.offsetY * pixelRatio,
              ),
          ],
        }
      }
    } else {
      // Return unmodified event, following default behavior
      return { eventName, filters, selector, moreChecks: [] }
    }
  }
