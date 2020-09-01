// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/common-tags` if it exists ... Remove this comment to see the full error message
import { stripIndent } from 'common-tags'
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/lodash` if it exists or ad... Remove this comment to see the full error message
import { range } from 'lodash'
import { Random } from './random'

const makeAttributes = (attrs={}) =>
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'entries' does not exist on type 'ObjectC... Remove this comment to see the full error message
  Object.entries(attrs)
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'attr' implicitly has an 'any' typ... Remove this comment to see the full error message
    .map(([attr, val]) => `${ attr }="${ val }"`)
    .join(' ')

const makeFooter = ({
  submitButtonPosition='right',
  submitButtonText
}: any) => {
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

const makeOptionRow = ({
  label,
  coding
}: any, {
  name,
  required=true
}: any, widget: any) => {
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

const makeLikertHead = ({
  width,
  anchors
}: any) => {
  if (anchors.every((a: any) => !a)) {
    return ''
  } else {
    return stripIndent`
      <thead class="sticky-top" style="background-color: white">
        <th class="sticky-top" style="background-color: white"></th>
        ${
          range(width).map((j: any) => stripIndent`
            <th
              class="sticky-top text-center small"
              style="background-color: white"
            >
              ${ anchors[j] || '' }
             </th>
          `).join('\n')
        }
      </thead>
    `;
  }
}

const makeLikertRow = ({
  label,
  coding
}: any, {
  name,
  width,
  required=true
}: any) =>
  stripIndent`
    <tr>
      <td class="small" style="padding-left: 0">
        ${ label }
      </td>
      ${
        range(1, Number(width) + 1).map((i: any) => stripIndent`
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

export const makePage = (items: any, options: any) => {
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
              .map((i: any) => processItem(i, { shuffleMeMaybe, ...options }))
              .join('\n')
          }
        </form>
      </div>
    </main>
    ${ makeFooter(options) }
  `;
}

export const processItem = (i: any, {
  shuffleMeMaybe
}: any) => {
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
        `
      )
    case 'textarea':
      return (
        stripIndent`
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
        `
      )
    case 'radio':
      return stripIndent`
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
                .map((o: any) => makeOptionRow(o, i, 'radio'))
                .join('\n')
            }
          </tbody>
        </table>
      `;
    case 'checkbox':
      return stripIndent`
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
                .map((o: any) => makeOptionRow(o, i, 'checkbox'))
                .join('\n')
            }
          </tbody>
        </table>
      `;
    case 'slider':
      return (
        stripIndent`
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
        `
      )
    case 'likert':
      return stripIndent`
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
                .map((item: any) => makeLikertRow(item, i))
                .join('\n')
            }
          </tbody>
        </table>
      `;
    default:
      console.error('Unknown page item type', i.type)
  }
}
