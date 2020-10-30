import { Component } from '../../base/component'

export const makeProcessEvent =
  (component: Component) =>
  (
    // Post-process event caught on canvas
    [eventName, filters, selector]: [string, any[], string],
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
          return function checkFunc(e: MouseEvent, context: Component) {
            const checkResult = context.options.ctx.isPointInPath(
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
            (e: MouseEvent) =>
              component.options.ctx.isPointInPath(
                component.internals.paths[selector.slice(1)],
                e.offsetX * pixelRatio,
                e.offsetY * pixelRatio,
              ),
          ],
        }
      }
    } else {
      // Return unmodified event, following default behavior
      return { eventName, filters, selector }
    }
  }
