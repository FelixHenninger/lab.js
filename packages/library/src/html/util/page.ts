import { stripIndent } from 'common-tags'
import { range } from 'lodash'
import { Random } from '../../util/random'

const makeAttributes = (attrs = {}) =>
  Object.entries(attrs)
    .map(([attr, val]) => `${attr}="${val}"`)
    .join(' ')

const makeFooter = ({
  submitButtonPosition = 'right',
  submitButtonText = 'Continue →',
}) => {
  if (submitButtonPosition !== 'hidden') {
    return stripIndent`
      <footer
        class="
          content-horizontal-${submitButtonPosition}
          content-vertical-center
        "
      >
        <button type="submit" form="page-form">
          ${submitButtonText}
        </button>
      </footer>
    `
  } else {
    return ''
  }
}

const makeOptionRow = (
  { label = '', coding = '' }: BaseOption,
  { name = '', required = true }: RadioItem | CheckboxItem,
  widget: 'radio' | 'checkbox',
) => {
  if (widget === 'radio') {
    return stripIndent`
      <tr>
        <td>
          <input
            type="radio"
            name="${name}"
            value="${coding}"
            id="${name}-${coding}"
            ${required ? 'required' : ''}
          >
        </td>
        <td>
          <label for="${name}-${coding}">
            ${label}
          </label
        </td>
      </tr>
    `
  } else if (widget === 'checkbox') {
    return stripIndent`
      <tr>
        <td>
          <input
            type="checkbox"
            name="${name}-${coding}"
            id="${name}-${coding}"
            ${required ? 'required' : ''}
          >
        </td>
        <td>
          <label for="${name}-${coding}">
            ${label}
          </label
        </td>
      </tr>
    `
  }
  return null
}

const makeLikertHead = ({ width, anchors }: LikertItem) => {
  if (anchors.every(a => !a)) {
    return ''
  } else {
    return stripIndent`
      <thead class="sticky-top">
        <th class="sticky-top"></th>
        ${range(width)
          .map(
            j => stripIndent`
            <th class="sticky-top text-center small">
              ${anchors[j] || ''}
            </th>
          `,
          )
          .join('\n')}
      </thead>
    `
  }
}

const makeLikertRow = (
  { label, coding }: { label: string; coding: string },
  { name, width, required = true }: LikertItem,
) =>
  stripIndent`
    <tr>
      <td class="small" style="padding-left: 0">
        ${label}
      </td>
      ${range(1, Number(width) + 1)
        .map(
          i => stripIndent`
          <td class="text-center">
            <label style="height: 100%; padding: 10px 0">
              <input type="radio"
                name="${name}-${coding}" value="${i}"
                ${required ? 'required' : ''}
              >
            </label>
          </td>
        `,
        )
        .join('\n')}
    </tr>
  `

export const makePage = (items: PageItem[], options: PageOptions) => {
  // Setup shuffling
  const rng = options.rng || new Random()
  const shuffleMeMaybe = <T>(array: T[] = [], doIt = false): T[] =>
    doIt ? rng.shuffle(array) : array

  return stripIndent`
    <main
      class="
        content-horizontal-center
        content-vertical-center
      "
    >
      <div class="w-${options.width || 'm'} text-left">
        <form id="page-form" style="display: block;" autocomplete="off">
          ${items
            .map(i => processItem(i, { shuffleMeMaybe, ...options }))
            .join('\n')}
        </form>
      </div>
    </main>
    ${makeFooter(options)}
  `
}

export const processItem = (
  i: PageItem,
  { shuffleMeMaybe }: { shuffleMeMaybe: <T>(a: T[], b: boolean) => T[] },
) => {
  switch (i.type) {
    case 'text':
      return stripIndent`
        <div class="page-item page-item-text">
          <h3>${i.title || ''}</h3>
          ${i.content || ''}
        </div>
      `
    case 'image':
      return stripIndent`
        <div class="page-item page-item-image">
          <img
            src="${i.src}"
            style="${i.width && 'max-width: ' + i.width} ${
              i.height && 'max-height: ' + i.height
            }"
          >
        </div>
      `
    case 'html':
      return stripIndent`
        <div class="page-item page-item-html">
          ${i.content || ''}
        </div>
      `
    case 'divider':
      return stripIndent`
        <div class="page-item page-item-divider">
          <hr>
        </div>
      `
    case 'input':
      return stripIndent`
        <div class="page-item page-item-input" id="page-item-${i.name}">
          <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
            ${i.label || ''}
          </p>
          <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
            ${i.help || ''}
          </p>
          <input name="${i.name}"
            ${i.required ? 'required' : ''}
            class="w-100"
            ${makeAttributes(i.attributes)}
          >
        </div>
      `
    case 'textarea':
      return stripIndent`
        <div class="page-item page-item-textarea" id="page-item-${i.name}">
          <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
            ${i.label || ''}
          </p>
          <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
            ${i.help || ''}
          </p>
          <textarea name="${i.name}"
            ${i.required ? 'required' : ''}
            class="w-100"
            rows="3"
          ></textarea>
        </div>
      `
    case 'radio':
      return stripIndent`
        <div class="page-item page-item-radio" id="page-item-${i.name}">
          <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
            ${i.label || ''}
          </p>
          <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
            ${i.help || ''}
          </p>
          <table class="table-plain page-item-table">
            <colgroup>
              <col style="width: 7.5%">
              <col style="width: 92.5%">
            </colgroup>
            <tbody>
              ${shuffleMeMaybe(i.options || [], i.shuffle)
                .map((o: BaseOption) => makeOptionRow(o, i, 'radio'))
                .join('\n')}
            </tbody>
          </table>
        </div>
      `
    case 'checkbox':
      return stripIndent`
        <div class="page-item page-item-checkbox" id="page-item-${i.name}">
          <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
            ${i.label || ''}
          </p>
          <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
            ${i.help || ''}
          </p>
          <table class="table-plain page-item-table">
            <colgroup>
              <col style="width: 7.5%">
              <col style="width: 92.5%">
            </colgroup>
            <tbody>
              ${shuffleMeMaybe(i.options || [], i.shuffle)
                .map((o: BaseOption) => makeOptionRow(o, i, 'checkbox'))
                .join('\n')}
            </tbody>
          </table>
        </div>
      `
    case 'slider':
      return stripIndent`
        <div class="page-item page-item-range" id="page-item-${i.name}">
          <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
            ${i.label || ''}
          </p>
          <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
            ${i.help || ''}
          </p>
          <input name="${i.name}" type="range"
            ${i.required ? 'required' : ''}
            class="w-100"
            ${makeAttributes(i.attributes)}
          >
        </div>
      `
    case 'likert':
      return stripIndent`
        <div class="page-item page-item-likert" id="page-item-${i.name}">
          <p class="font-weight-bold" style="margin: 1rem 0 0.25rem">
            ${i.label || ''}
          </p>
          <p class="small text-muted hide-if-empty" style="margin: 0.25rem 0">
            ${i.help || ''}
          </p>
          <table class="page-item-table">
            <colgroup>
              <col style="width: 40%">
              ${range(i.width)
                .map(() => `<col style="width: ${60 / i.width}%">`)
                .join('\n')}
            </colgroup>
            ${makeLikertHead(i)}
            <tbody>
              ${shuffleMeMaybe(i.items || [], i.shuffle)
                .map((item: { label: string; coding: string }) =>
                  makeLikertRow(item, i),
                )
                .join('\n')}
            </tbody>
          </table>
        </div>
      `
    default:
      console.error('Unknown page item type')
      return null
  }
}

// Page options ----------------------------------------------------------------

type PageOptions = {
  rng?: Random
  width: 's' | 'm' | 'l' | 'xl'
  submitButtonText: string
  submitButtonPosition: 'left' | 'right' | 'center' | 'hidden'
}

// Base items ------------------------------------------------------------------

type TextItem = {
  type: 'text'
  title: string
  content: string
}

type HTMLItem = {
  type: 'html'
  content: string
}

export type ImageItem = {
  type: 'image'
  src: string
  width?: number
  height?: number
}

type DividerItem = {
  type: 'divider'
}

// Questionnaire fields --------------------------------------------------------

type BaseItem = {
  name: string
  label?: string
  help?: string
  required: boolean
  attributes: { [attr: string]: any }
}

type BaseOption = {
  name: string
  coding: string
  label: string
  required: boolean
}

type InputItem = BaseItem & {
  type: 'input'
}

type TextareaItem = BaseItem & {
  type: 'textarea'
}

type RadioItem = BaseItem & {
  type: 'radio'
  options: BaseOption[]
  shuffle: boolean
}

type CheckboxItem = BaseItem & {
  type: 'checkbox'
  options: BaseOption[]
  shuffle: boolean
}

type SliderItem = BaseItem & {
  type: 'slider'
}

type LikertItem = BaseItem & {
  type: 'likert'
  width: number
  anchors: string[]
  items: {
    label: string
    coding: string
  }[]
  shuffle: boolean
}

export type PageItem =
  | TextItem
  | HTMLItem
  | ImageItem
  | DividerItem
  | InputItem
  | TextareaItem
  | RadioItem
  | CheckboxItem
  | SliderItem
  | LikertItem
