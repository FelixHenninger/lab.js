import { transform, pickBy } from 'lodash'

const defaults = {
  left: 0, top: 0,
  width: 50, height: 50,
  angle: 0,
  stroke: null, fill: 'black'
}

// TODO: Add proper validation mechanism
// and alert user to nonsensical values
const toNumber = (s, fallback=0) => {
  if (['', '+', '-'].includes(s)) {
    return 0
  } else {
    return Number(s) || fallback
  }
}

const isPlaceholder = o =>
  typeof o === 'string' && o.includes('$')

export const toCanvas = object => {
  if (!object) {
    return object
  } else {
    const output = {
      ...object,
      // Substitute defaults where placeholders are used
      // (except for text content, which is passed through)
      ...transform(object, (result, v, k) => {
        if (isPlaceholder(v) && k !== 'text') {
          result[k] = defaults[k]
        } else if (['left', 'top', 'angle', 'width', 'height'].includes(k)) {
          result[k] = toNumber(
            object[k], defaults[k], // fallback values
          )
        }
      }),
      // Lock manipulations where placeholders are present
      lockMovementX: isPlaceholder(object.left),
      lockMovementY: isPlaceholder(object.top),
      lockScalingX: isPlaceholder(object.width),
      lockScalingY: isPlaceholder(object.height) || object.type === 'line',
      lockRotation: isPlaceholder(object.angle),
    }

    if (object.type === 'circle') {
      output.radius = output.width / 2
    } else if (output.type === 'ellipse') {
      output.rx = output.width / 2
      output.ry = output.height / 2
    } else if (output.type === 'line') {
      output.x1 = output.left - output.width / 2
      output.x2 = output.left + output.width / 2
      output.y1 = output.top
      output.y2 = output.top
    }

    return output
  }
}

export const fromCanvas = (object, oldObject) => {
  if (!object) {
    return object
  }

  return {
    // Filter manipulation locks
    ...pickBy(object, (v, k) => !k.startsWith('lock')),
    // Placeholders can't be overridden
    ...transform(object, (result, v, k) => {
      if (isPlaceholder(oldObject[k]) && k !== 'text') {
        result[k] = oldObject[k]
      }
    }),
  }
}
