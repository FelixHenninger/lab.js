import { stripIndent } from 'common-tags'
import { range } from 'lodash'
import { Random } from './random'

const makeAttributes = (attrs={}) =>
  Object.entries(attrs)
    .map(([attr, val]) => `${ attr }="${ val }"`)
    .join(' ')

const makeFooter = ({ submitButtonPosition='right', submitButtonText }) => {
  if (submitButtonPosition !== 'hidden') {
    return (
      stripIndent`
        <footer
          class="
            content-horizontal-${ submitButtonPosition }
            content-vertical-center
          "
        >
          <button type="submit" form="page-form">
            ${ submitButtonText }
          </button>
        </footer>
      `
    )
  } else {
    return ''
  }
}

const makeOptionRow = ({ label, coding }, { name, required=true }, widget) => {
  if (widget === 'radio') {
    return (
      stripIndent`
        <tr>
          <td>
            <input
              type="radio"
              name="${ name }"
              value="${ coding }"
              id="${ name }-${ coding }"
              ${ required ? 'required' : '' }
            >
          </td>
          <td>
            <label for="${ name }-${ coding }">
              ${ label }
            </label
          </td>
        </tr>
      `
    )
  } else if (widget === 'checkbox') {
    return (
      stripIndent`
        <tr>
          <td>
            <input
              type="checkbox"
              name="${ name }-${ coding }"
              id="${ name }-${ coding }"
              ${ required ? 'required' : '' }
            >
          </td>
          <td>
            <label for="${ name }-${ coding }">
              ${ label }
            </label
          </td>
        </tr>
      `
    )
  }
}

const makeLikertHead = ({ width, anchors }) => {
  if (anchors.every(a => !a)) {
    return ''
  } else {
    return stripIndent`
      <thead class="sticky-top" style="background-color: white">
        <th class="sticky-top" style="background-color: white"></th>
        ${
          range(width).map(j => stripIndent`
            <th
              class="sticky-top text-center small"
              style="background-color: white"
            >
              ${ anchors[j] || '' }
             </th>
          `).join('\n')
        }
      </thead>
    `
  }
}

const makeLikertRow = ({ label, coding }, { name, width, required=true }) =>
  stripIndent`
    <tr>
      <td class="small" style="padding-left: 0">
        ${ label }
      </td>
      ${
        range(1, Number(width) + 1).map(i => stripIndent`
          <td class="text-center">
            <label style="height: 100%; padding: 10px 0">
              <input type="radio"
                name="${ name }-${ coding }" value="${ i }"
                ${ required ? 'required' : '' }
              >
            </label>
          </td>
        `).join('\n')
      }
    </tr>
  `

export const makePage = (items, options) => {
  // Setup shuffling
  const rng = options.rng || new Random()
  const shuffleMeMaybe = (array=[], doIt=false) =>
    (doIt ? rng.shuffle(array) : array)

  return stripIndent`
    <main
      class="
        content-horizontal-center
        content-vertical-center
      "
    >
      <div class="w-${ options.width || 'm' } text-left">
        <form id="page-form" style="display: block;" autocomplete="off">
          ${
            items
              .map(i => processItem(i, { shuffleMeMaybe, ...options }))
              .join('\n')
          }
        </form>
      </div>
    </main>
    ${ makeFooter(options) }
  `
}

export const processItem = (i, { shuffleMeMaybe }) => {
  switch (i.type) {
    case 'text':
      return (
        stripIndent`
          <div class="page-item page-item-text">
            <h3>${ i.title || '' }</h3>
            ${ i.content || '' }
          </div>
        `
      )
    case 'image':
      return (
        stripIndent`
          <div class="page-item page-item-image">
            <img
              src="${ i.src }"
              style="${ i.width && 'max-width: ' + i.width } ${ i.height && 'max-height: ' + i.height }"
            >
          </div>
        `
      )
    case 'html':
      return (
        stripIndent`
          <div class="page-item page-item-html">
            ${ i.content || '' }
          </div>
        `
      )
    case 'divider':
      return (
        stripIndent`
          <div class="page-item page-item-divider">
            <hr>
          </div>
        `
      )
    case 'input':
      return (
        stripIndent`
          <div class="page-item page-item-input" id="page-item-${ i.name }">
            <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
              ${ i.label || '' }
            </p>
            <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
              ${ i.help || '' }
            </p>
            <input name="${ i.name }"
              ${ i.required ? 'required' : '' }
              class="w-100"
              ${ makeAttributes(i.attributes) }
            >
          </div>
        `
      )
    case 'textarea':
      return (
        stripIndent`
          <div class="page-item page-item-textarea" id="page-item-${ i.name }">
            <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
              ${ i.label || '' }
            </p>
            <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
              ${ i.help || '' }
            </p>
            <textarea name="${ i.name }"
              ${ i.required ? 'required' : '' }
              class="w-100"
              rows="3"
            ></textarea>
          </div>
        `
      )
    case 'radio':
      return (
        stripIndent`
          <div class="page-item page-item-radio" id="page-item-${ i.name }">
            <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
              ${ i.label || '' }
            </p>
            <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
              ${ i.help || '' }
            </p>
            <table class="table-plain page-item-table">
              <colgroup>
                <col style="width: 7.5%">
                <col style="width: 92.5%">
              </colgroup>
              <tbody>
                ${
                  shuffleMeMaybe(i.options || [], i.shuffle)
                    .map(o => makeOptionRow(o, i, 'radio'))
                    .join('\n')
                }
              </tbody>
            </table>
          </div>
        `
      )
    case 'checkbox':
      return (
        stripIndent`
          <div class="page-item page-item-checkbox" id="page-item-${ i.name }">
            <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
              ${ i.label || '' }
            </p>
            <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
              ${ i.help || '' }
            </p>
            <table class="table-plain page-item-table">
              <colgroup>
                <col style="width: 7.5%">
                <col style="width: 92.5%">
              </colgroup>
              <tbody>
                ${
                  shuffleMeMaybe(i.options || [], i.shuffle)
                    .map(o => makeOptionRow(o, i, 'checkbox'))
                    .join('\n')
                }
              </tbody>
            </table>
          </div>
        `
      )
    case 'slider':
      return (
        stripIndent`
          <div class="page-item page-item-range" id="page-item-${ i.name }">
            <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
              ${ i.label || '' }
            </p>
            <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
              ${ i.help || '' }
            </p>
            <input name="${ i.name }" type="range"
              ${ i.required ? 'required' : '' }
              class="w-100"
              ${ makeAttributes(i.attributes) }
            >
          </div>
        `
      )
    case 'likert':
      return (
        stripIndent`
          <div class="page-item page-item-likert" id="page-item-${ i.name }">
            <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
              ${ i.label || '' }
            </p>
            <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
              ${ i.help || '' }
            </p>
            <table class="page-item-table">
              <colgroup>
                <col style="width: 40%">
                ${
                  range(i.width).map(() =>
                    `<col style="width: ${ 60 / i.width }%">`
                  ).join('\n')
                }
              </colgroup>
              ${ makeLikertHead(i) }
              <tbody>
                ${
                  shuffleMeMaybe(i.items || [], i.shuffle)
                    .map(item => makeLikertRow(item, i))
                    .join('\n')
                }
              </tbody>
            </table>
          </div>
        `
      )
    default:
      console.error('Unknown page item type', i.type)
  }
}
